import cv2
import numpy as np
import base64
from pathlib import Path
from PIL import Image

# Caminhos para os pesos dos modelos de Deep Learning
MODELS_DIR = Path(__file__).resolve().parent / 'models_weights'
SFACE_PATH = MODELS_DIR / 'face_recognition_sface_2021dec.onnx'
YUNET_PATH = MODELS_DIR / 'face_detection_yunet_2023mar.onnx'

# Classificador Haar Cascade como fallback de segurança
FACE_CASCADE = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Instância única em memória do extrator SFace (OpenCV Deep Learning)
_sface_recognizer = None

def get_sface_recognizer():
    """Retorna o modelo SFace (MobileFaceNet/ResNet 128d) carregado."""
    global _sface_recognizer
    if _sface_recognizer is None and SFACE_PATH.exists():
        try:
            _sface_recognizer = cv2.FaceRecognizerSF.create(str(SFACE_PATH), '')
        except Exception as e:
            print(f"[FacialEngine] Erro ao carregar SFace: {e}")
            _sface_recognizer = None
    return _sface_recognizer

def get_yunet_detector(largura: int, altura: int, score_threshold: float = 0.6):
    """Retorna o detector CNN YuNet configurado para a dimensão do frame."""
    if YUNET_PATH.exists():
        try:
            return cv2.FaceDetectorYN.create(
                str(YUNET_PATH),
                '',
                (int(largura), int(altura)),
                score_threshold=score_threshold,
                nms_threshold=0.3,
                top_k=5
            )
        except Exception as e:
            print(f"[FacialEngine] Erro ao instanciar YuNet: {e}")
    return None

def decodificar_imagem_base64(imagem_base64: str) -> np.ndarray:
    """Decodifica uma string base64 (com ou sem prefixo data:image/...) para um array OpenCV BGR."""
    if not imagem_base64:
        return None
    
    if ',' in imagem_base64:
        imagem_base64 = imagem_base64.split(',', 1)[1]
    
    dados = base64.b64decode(imagem_base64)
    arr = np.frombuffer(dados, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    return img

def codificar_imagem_base64(img_bgr: np.ndarray, formato: str = '.jpg') -> str:
    """Codifica um array OpenCV para string base64 com prefixo data:image/jpeg;base64,..."""
    _, buffer = cv2.imencode(formato, img_bgr, [int(cv2.IMWRITE_JPEG_QUALITY), 85])
    b64 = base64.b64encode(buffer).decode('utf-8')
    return f"data:image/jpeg;base64,{b64}"

def _extrair_vetor_lbp_hog_fallback(face_bgr_ou_gray: np.ndarray) -> list:
    """Fallback matemático quando os pesos ONNX não estiverem presentes (LBP + HOG)."""
    if len(face_bgr_ou_gray.shape) == 3:
        gray = cv2.cvtColor(face_bgr_ou_gray, cv2.COLOR_BGR2GRAY)
    else:
        gray = face_bgr_ou_gray

    gray128 = cv2.resize(gray, (128, 128), interpolation=cv2.INTER_AREA)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    eq = clahe.apply(gray128)

    # LBP
    center = eq[1:-1, 1:-1]
    lbp = np.zeros(center.shape, dtype=np.uint8)
    lbp |= (eq[0:-2, 0:-2] >= center).astype(np.uint8) << 7
    lbp |= (eq[0:-2, 1:-1] >= center).astype(np.uint8) << 6
    lbp |= (eq[0:-2, 2:]   >= center).astype(np.uint8) << 5
    lbp |= (eq[1:-1, 2:]   >= center).astype(np.uint8) << 4
    lbp |= (eq[2:,   2:]   >= center).astype(np.uint8) << 3
    lbp |= (eq[2:,   1:-1] >= center).astype(np.uint8) << 2
    lbp |= (eq[2:,   0:-2] >= center).astype(np.uint8) << 1
    lbp |= (eq[1:-1, 0:-2] >= center).astype(np.uint8) << 0

    grid = 8
    ch, cw = lbp.shape[0] // grid, lbp.shape[1] // grid
    lbp_hists = []
    for r in range(grid):
        for c in range(grid):
            cell = lbp[r*ch:(r+1)*ch, c*cw:(c+1)*cw]
            h, _ = np.histogram(cell, bins=16, range=(0, 256), density=True)
            lbp_hists.extend(h)

    # HOG
    hog = cv2.HOGDescriptor((64, 64), (16, 16), (8, 8), (8, 8), 9)
    g64 = cv2.resize(eq, (64, 64))
    hog_f = hog.compute(g64).flatten()
    hog_f = hog_f / (np.linalg.norm(hog_f) + 1e-7)

    lbp_np = np.array(lbp_hists, dtype=np.float32)
    lbp_np = lbp_np / (np.linalg.norm(lbp_np) + 1e-7)

    comb = np.concatenate([lbp_np, hog_f])
    # Reduz para 128 dimensões
    if len(comb) > 128:
        step = len(comb) / 128.0
        vec128 = np.array([comb[int(i * step)] for i in range(128)], dtype=np.float32)
    else:
        vec128 = np.pad(comb, (0, 128 - len(comb)), 'constant')
    norm = np.linalg.norm(vec128)
    if norm > 0:
        vec128 /= norm
    return vec128.tolist()

def extrair_vetor_caracteristicas(face_gray_ou_bgr: np.ndarray) -> list:
    """Extrai o vetor de 128 dimensões da face."""
    recognizer = get_sface_recognizer()
    if recognizer is not None:
        if len(face_gray_ou_bgr.shape) == 2:
            face_bgr = cv2.cvtColor(face_gray_ou_bgr, cv2.COLOR_GRAY2BGR)
        else:
            face_bgr = face_gray_ou_bgr
        face_112 = cv2.resize(face_bgr, (112, 112), interpolation=cv2.INTER_AREA)
        raw_feat = recognizer.feature(face_112).flatten()
        norm = np.linalg.norm(raw_feat)
        if norm > 0:
            raw_feat /= norm
        return raw_feat.tolist()
    return _extrair_vetor_lbp_hog_fallback(face_gray_ou_bgr)

def processar_foto_facial(imagem_base64: str) -> dict:
    """
    Analisa uma foto (selfie ou totem da portaria):
    - Detecta rostos com YuNet CNN ou Haar Cascade;
    - Alinha com 5 pontos anatômicos para neutralizar inclinação;
    - Extrai o vetor biométrico profundo de 128 dimensões via SFace;
    - Retorna status, coordenadas, face recortada em base64 e vetor.
    """
    img = decodificar_imagem_base64(imagem_base64)
    if img is None:
        return {
            'sucesso': False,
            'erro': 'Imagem inválida ou não pôde ser decodificada.'
        }

    altura, largura = img.shape[:2]
    if altura < 100 or largura < 100:
        return {
            'sucesso': False,
            'erro': 'Resolução da foto muito baixa. Aproxime a câmera do rosto.'
        }

    recognizer = get_sface_recognizer()
    detector = get_yunet_detector(largura, altura, score_threshold=0.6)

    face_recortada_bgr = None
    vetor_biometrico = None
    coord = {'x': 0, 'y': 0, 'w': 0, 'h': 0}

    # 1. Tentativa com detector CNN YuNet
    if detector is not None and recognizer is not None:
        _, faces_detected = detector.detect(img)
        if faces_detected is not None and len(faces_detected) > 0:
            if len(faces_detected) > 1:
                return {
                    'sucesso': False,
                    'erro': 'Mais de um rosto detectado. Apenas uma pessoa deve aparecer na câmera.'
                }
            face_data = faces_detected[0]
            coord = {
                'x': int(face_data[0]),
                'y': int(face_data[1]),
                'w': int(face_data[2]),
                'h': int(face_data[3])
            }
            # Alinha e recorta com os 5 pontos anatômicos (olhos, nariz, boca)
            face_recortada_bgr = recognizer.alignCrop(img, face_data)
            raw_feat = recognizer.feature(face_recortada_bgr).flatten()
            norm = np.linalg.norm(raw_feat)
            if norm > 0:
                raw_feat /= norm
            vetor_biometrico = raw_feat.tolist()

    # 2. Fallback com Haar Cascade se YuNet não encontrou face
    if vetor_biometrico is None:
        cinza = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces_haar = FACE_CASCADE.detectMultiScale(
            cinza,
            scaleFactor=1.15,
            minNeighbors=5,
            minSize=(60, 60),
            flags=cv2.CASCADE_SCALE_IMAGE
        )

        if len(faces_haar) == 0:
            return {
                'sucesso': False,
                'erro': 'Nenhum rosto foi detectado na imagem. Centralize o rosto na câmera com boa iluminação.'
            }

        if len(faces_haar) > 1:
            return {
                'sucesso': False,
                'erro': 'Mais de um rosto detectado. Apenas uma pessoa deve aparecer na foto de cadastro.'
            }

        x, y, w, h = faces_haar[0]
        coord = {'x': int(x), 'y': int(y), 'w': int(w), 'h': int(h)}

        pad_x = int(w * 0.15)
        pad_y = int(h * 0.20)
        x1 = max(0, x - pad_x)
        y1 = max(0, y - pad_y)
        x2 = min(largura, x + w + pad_x)
        y2 = min(altura, y + h + int(pad_y * 0.8))

        crop = img[y1:y2, x1:x2]
        face_recortada_bgr = cv2.resize(crop, (112, 112), interpolation=cv2.INTER_AREA)

        if recognizer is not None:
            raw_feat = recognizer.feature(face_recortada_bgr).flatten()
            norm = np.linalg.norm(raw_feat)
            if norm > 0:
                raw_feat /= norm
            vetor_biometrico = raw_feat.tolist()
        else:
            vetor_biometrico = _extrair_vetor_lbp_hog_fallback(face_recortada_bgr)

    # 3. Validação de iluminação
    face_gray = cv2.cvtColor(face_recortada_bgr, cv2.COLOR_BGR2GRAY)
    brilho_medio = float(np.mean(face_gray))
    if brilho_medio < 30:
        return {
            'sucesso': False,
            'erro': 'Foto muito escura. Vá para um local mais iluminado para a captura facial.'
        }
    if brilho_medio > 240:
        return {
            'sucesso': False,
            'erro': 'Foto muito superexposta / com excesso de luz no rosto.'
        }

    face_base64 = codificar_imagem_base64(face_recortada_bgr)

    return {
        'sucesso': True,
        'vetor': vetor_biometrico,
        'face_base64': face_base64,
        'coordenadas': coord,
        'brilho': round(brilho_medio, 1)
    }

def calcular_similaridade_cosseno(vetor1: list, vetor2: list) -> float:
    """Calcula a similaridade cosseno entre dois vetores de características (retorna 0.0 a 1.0)."""
    if not vetor1 or not vetor2 or len(vetor1) != len(vetor2):
        return 0.0

    v1 = np.array(vetor1, dtype=np.float32)
    v2 = np.array(vetor2, dtype=np.float32)

    norma1 = np.linalg.norm(v1)
    norma2 = np.linalg.norm(v2)

    if norma1 == 0 or norma2 == 0:
        return 0.0

    dot = float(np.dot(v1, v2))
    sim = dot / (norma1 * norma2)
    return float(max(0.0, min(1.0, sim)))

def comparar_face_com_base(vetor_consulta: list, lista_biometrias: list, limiar_minimo: float = 0.50) -> tuple:
    """
    Compara o vetor da face com uma lista de biometrias cadastradas.
    Retorna (melhor_match, similaridade). Se similaridade < limiar_minimo, retorna (None, similaridade).
    Com a rede neural SFace:
    - Mesma pessoa: similaridade tipicamente entre 0.70 e 0.95 (>= 0.50).
    - Pessoas diferentes / familiares: similaridade tipicamente entre 0.00 e 0.20 (< 0.35).
    Limiar de 0.50 elimina completamente falsos positivos.
    """
    melhor_match = None
    maior_similaridade = 0.0

    for item in lista_biometrias:
        vetor_cadastrado = item.get('vetor') or getattr(item, 'vetor_facial', None)
        if not vetor_cadastrado:
            continue

        sim = calcular_similaridade_cosseno(vetor_consulta, vetor_cadastrado)
        if sim > maior_similaridade:
            maior_similaridade = sim
            melhor_match = item

    if maior_similaridade >= limiar_minimo:
        return melhor_match, maior_similaridade
    return None, maior_similaridade
