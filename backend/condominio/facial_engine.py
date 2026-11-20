import cv2
import numpy as np
import base64
import io
from PIL import Image

# Carrega o classificador oficial pré-treinado do OpenCV
FACE_CASCADE = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

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

def extrair_vetor_caracteristicas(face_gray_128: np.ndarray) -> list:
    """
    Gera um vetor de características faciais de 128 dimensões a partir de uma face alinhada 128x128.
    Utiliza divisão espacial por blocos (8x8 células) combinando intensidade normalizada e gradientes Sobel.
    """
    # 1. Equalização adaptativa de histograma (CLAHE) para neutralizar sombras e variações de iluminação
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    face_eq = clahe.apply(face_gray_128)

    # 2. Gradientes horizontais e verticais de Sobel
    grad_x = cv2.Sobel(face_eq, cv2.CV_32F, 1, 0, ksize=3)
    grad_y = cv2.Sobel(face_eq, cv2.CV_32F, 0, 1, ksize=3)
    magnitude, _ = cv2.cartToPolar(grad_x, grad_y)

    # 3. Divide a imagem 128x128 em grade de 8x8 blocos (cada bloco tem 16x16 pixels)
    bloco_tam = 16
    vetor = []

    for r in range(0, 128, bloco_tam):
        for c in range(0, 128, bloco_tam):
            sub_intensidade = face_eq[r:r+bloco_tam, c:c+bloco_tam]
            sub_gradiente = magnitude[r:r+bloco_tam, c:c+bloco_tam]
            
            # Extrai média de intensidade e média de gradiente de cada setor
            m_int = float(np.mean(sub_intensidade) / 255.0)
            m_grad = float(np.mean(sub_gradiente) / 255.0)
            vetor.extend([m_int, m_grad])

    vetor_np = np.array(vetor, dtype=np.float32)
    norma = np.linalg.norm(vetor_np)
    if norma > 0:
        vetor_np = vetor_np / norma

    return vetor_np.tolist()

def processar_foto_facial(imagem_base64: str) -> dict:
    """
    Analisa uma foto (selfie ou câmera da portaria):
    - Detecta rostos;
    - Valida qualidade (iluminação, tamanho e se há exatamente 1 face);
    - Recorta a face;
    - Gera o vetor biométrico numérico;
    - Retorna resumo com status.
    """
    img = decodificar_imagem_base64(imagem_base64)
    if img is None:
        return {
            'sucesso': False,
            'erro': 'Imagem inválida ou não pôde ser decodificada.'
        }

    altura, largura = img.shape[:2]
    if altura < 120 or largura < 120:
        return {
            'sucesso': False,
            'erro': 'Resolução da foto muito baixa. Aproxime a câmera do rosto.'
        }

    cinza = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Detecta rostos com escala ajustada
    faces = FACE_CASCADE.detectMultiScale(
        cinza,
        scaleFactor=1.15,
        minNeighbors=5,
        minSize=(60, 60),
        flags=cv2.CASCADE_SCALE_IMAGE
    )

    if len(faces) == 0:
        return {
            'sucesso': False,
            'erro': 'Nenhum rosto foi detectado na imagem. Centralize o rosto na câmera com boa iluminação.'
        }

    if len(faces) > 1:
        return {
            'sucesso': False,
            'erro': 'Mais de um rosto detectado. Apenas uma pessoa deve aparecer na foto de cadastro.'
        }

    x, y, w, h = faces[0]

    # Adiciona uma margem de segurança de 15% ao redor do rosto
    pad_x = int(w * 0.15)
    pad_y = int(h * 0.20)
    x1 = max(0, x - pad_x)
    y1 = max(0, y - pad_y)
    x2 = min(largura, x + w + pad_x)
    y2 = min(altura, y + h + int(pad_y * 0.8))

    face_recortada_bgr = img[y1:y2, x1:x2]
    face_recortada_gray = cinza[y1:y2, x1:x2]

    # Redimensiona para o padrão 128x128
    face_128_gray = cv2.resize(face_recortada_gray, (128, 128), interpolation=cv2.INTER_AREA)
    face_128_bgr = cv2.resize(face_recortada_bgr, (128, 128), interpolation=cv2.INTER_AREA)

    # Calcula brilho médio
    brilho_medio = np.mean(face_128_gray)
    if brilho_medio < 35:
        return {
            'sucesso': False,
            'erro': 'Foto muito escura. Vá para um local mais iluminado para a captura facial.'
        }
    if brilho_medio > 230:
        return {
            'sucesso': False,
            'erro': 'Foto muito superexposta / com excesso de luz no rosto.'
        }

    vetor_biometrico = extrair_vetor_caracteristicas(face_128_gray)
    face_base64 = codificar_imagem_base64(face_128_bgr)

    return {
        'sucesso': True,
        'vetor': vetor_biometrico,
        'face_base64': face_base64,
        'coordenadas': {'x': int(x), 'y': int(y), 'w': int(w), 'h': int(h)},
        'brilho': float(brilho_medio)
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

    dot = np.dot(v1, v2)
    sim = dot / (norma1 * norma2)
    return float(max(0.0, min(1.0, sim)))

def comparar_face_com_base(vetor_consulta: list, lista_biometrias: list, limiar_minimo: float = 0.80) -> tuple:
    """
    Compara o vetor da face com uma lista de biometrias cadastradas.
    Retorna (melhor_match, similaridade). Se similaridade < limiar_minimo, retorna (None, similaridade).
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
