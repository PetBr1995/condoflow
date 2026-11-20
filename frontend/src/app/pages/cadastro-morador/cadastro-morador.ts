import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { API_CONFIG } from '../../config';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-cadastro-morador',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  styleUrls: ['./cadastro-morador.css'],
  templateUrl: './cadastro-morador.html',
})
export class CadastroMorador implements OnInit, OnDestroy {
  @ViewChild('videoScannerRef') videoScannerRef!: ElementRef<HTMLVideoElement>;

  // Controle de Etapas: 1 = Dados, 2 = Scanner Facial, 3 = Sucesso
  etapaAtual: 1 | 2 | 3 = 1;

  // Dados do formulário
  nome: string = '';
  sobrenome: string = '';
  telefone: string = '';
  cpf: string = '';
  codigo: string = '';
  senha: string = '';
  confirmarSenha: string = '';

  // Câmera & Scanner Facial
  cameraAtiva: boolean = false;
  streamCamera: MediaStream | null = null;
  fotoBase64: string = '';
  processandoEnvio: boolean = false;

  // Feedback & Mensagens
  erroCadastro: string = '';
  cadastroConcluido: string = '';
  resumoCadastro: any = null;

  // Modal de Configuração do Backend
  mostrarModalConfig: boolean = false;
  urlServidorCustom: string = '';
  isMobileNative: boolean = Capacitor.isNativePlatform();

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.urlServidorCustom = API_CONFIG.baseUrl;
  }

  ngOnDestroy(): void {
    this.pararCamera();
  }

  // --- NAVEGAÇÃO DE ETAPAS ---

  avancarParaScanner(): void {
    this.erroCadastro = '';

    // Validações dos campos obrigatórios
    if (
      !this.nome.trim() ||
      !this.sobrenome.trim() ||
      !this.telefone.trim() ||
      !this.cpf.trim() ||
      !this.codigo.trim() ||
      !this.senha ||
      !this.confirmarSenha
    ) {
      this.erroCadastro = 'Por favor, preencha todos os campos antes de avançar.';
      return;
    }

    const cpfNumeros = this.cpf.replace(/\D/g, '');
    const telefoneNumeros = this.telefone.replace(/\D/g, '');

    if (!this.cpfValido(cpfNumeros)) {
      this.erroCadastro = 'Informe um CPF válido com 11 dígitos.';
      return;
    }

    if (telefoneNumeros.length < 10 || telefoneNumeros.length > 11) {
      this.erroCadastro = 'Informe um WhatsApp/celular com DDD válido.';
      return;
    }

    if (this.senha.length < 8) {
      this.erroCadastro = 'A senha deve ter no mínimo 8 caracteres.';
      return;
    }

    if (/^\d+$/.test(this.senha)) {
      this.erroCadastro = 'A senha não pode conter apenas números.';
      return;
    }

    if (this.senha !== this.confirmarSenha) {
      this.erroCadastro = 'As senhas informadas não coincidem.';
      return;
    }

    // Avança para a Etapa 2 e liga a câmera automaticamente
    this.etapaAtual = 2;
    setTimeout(() => {
      this.iniciarCamera();
    }, 200);
  }

  voltarParaDados(): void {
    this.pararCamera();
    this.etapaAtual = 1;
    this.erroCadastro = '';
  }

  // --- SCANNER FACIAL & CÂMERA ---

  async iniciarCamera(): Promise<void> {
    this.erroCadastro = '';
    this.cameraAtiva = true;

    try {
      this.streamCamera = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 720 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setTimeout(() => {
        if (this.videoScannerRef && this.videoScannerRef.nativeElement) {
          this.videoScannerRef.nativeElement.srcObject = this.streamCamera;
        }
      }, 150);
    } catch (err) {
      this.cameraAtiva = false;
      this.erroCadastro = 'Não foi possível acessar a câmera frontal. Verifique as permissões do dispositivo.';
    }
  }

  pararCamera(): void {
    if (this.streamCamera) {
      this.streamCamera.getTracks().forEach((track) => track.stop());
      this.streamCamera = null;
    }
    this.cameraAtiva = false;
  }

  capturarFoto(): void {
    if (!this.videoScannerRef || !this.videoScannerRef.nativeElement) return;
    const video = this.videoScannerRef.nativeElement;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 640;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      this.fotoBase64 = canvas.toDataURL('image/jpeg', 0.88);
      this.pararCamera();
    }
  }

  refazerFoto(): void {
    this.fotoBase64 = '';
    this.iniciarCamera();
  }

  carregarFotoGaleria(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.fotoBase64 = reader.result as string;
        this.pararCamera();
      };
      reader.readAsDataURL(file);
    }
  }

  // --- SUBMISSÃO DO CADASTRO + SCANNER PARA O BACKEND ---

  finalizarCadastro(): void {
    if (!this.fotoBase64) {
      this.erroCadastro = 'Por favor, realize o escaneamento facial antes de concluir.';
      return;
    }

    this.processandoEnvio = true;
    this.erroCadastro = '';

    const dadosEnvio = {
      first_name: this.nome.trim(),
      last_name: this.sobrenome.trim(),
      cpf: this.cpf.replace(/\D/g, ''),
      telefone: this.telefone.replace(/\D/g, ''),
      codigo_registro: this.codigo.trim().toUpperCase(),
      password: this.senha,
      foto_base64: this.fotoBase64
    };

    this.http.post(`${API_CONFIG.baseUrl}usuarios/`, dadosEnvio).subscribe({
      next: (resposta: any) => {
        this.processandoEnvio = false;
        this.resumoCadastro = resposta;
        this.cadastroConcluido = 'Morador cadastrado com sucesso! Biometria facial ativada nas portarias.';
        this.etapaAtual = 3;
        this.pararCamera();
      },
      error: (erro: any) => {
        this.processandoEnvio = false;
        console.error('Erro no cadastro:', erro.error);

        if (erro.error?.foto_base64) {
          const msg = Array.isArray(erro.error.foto_base64) ? erro.error.foto_base64[0] : erro.error.foto_base64;
          this.erroCadastro = `Aviso Biométrico: ${msg}`;
        } else if (erro.error?.codigo_registro) {
          const msg = Array.isArray(erro.error.codigo_registro) ? erro.error.codigo_registro[0] : erro.error.codigo_registro;
          this.erroCadastro = `Código Inválido: ${msg}`;
        } else if (erro.error?.cpf || erro.error?.username) {
          this.erroCadastro = 'Já existe um morador cadastrado com este CPF no sistema.';
        } else if (typeof erro.error === 'object') {
          const primeiro = Object.values(erro.error)[0];
          this.erroCadastro = Array.isArray(primeiro) ? primeiro[0] : String(primeiro);
        } else {
          this.erroCadastro = 'Falha na comunicação com o servidor. Verifique sua conexão e a URL configurada.';
        }
      }
    });
  }

  // --- REINICIAR FLUXO ---

  novoCadastro(): void {
    this.nome = '';
    this.sobrenome = '';
    this.telefone = '';
    this.cpf = '';
    this.codigo = '';
    this.senha = '';
    this.confirmarSenha = '';
    this.fotoBase64 = '';
    this.erroCadastro = '';
    this.cadastroConcluido = '';
    this.resumoCadastro = null;
    this.etapaAtual = 1;
  }

  // --- MODAL DE CONFIGURAÇÃO DE SERVIDOR ---

  abrirConfigServidor(): void {
    this.urlServidorCustom = API_CONFIG.baseUrl;
    this.mostrarModalConfig = true;
  }

  fecharConfigServidor(): void {
    this.mostrarModalConfig = false;
  }

  salvarConfigServidor(): void {
    API_CONFIG.setCustomUrl(this.urlServidorCustom);
    this.mostrarModalConfig = false;
  }

  restaurarServidorPadrao(): void {
    API_CONFIG.setCustomUrl('');
    this.urlServidorCustom = API_CONFIG.baseUrl;
    this.mostrarModalConfig = false;
  }

  // --- VALIDAÇÃO CPF ---

  private cpfValido(cpf: string): boolean {
    if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;

    const calcularDigito = (tamanho: number): number => {
      const soma = cpf
        .slice(0, tamanho)
        .split('')
        .reduce((total, digito, indice) => total + Number(digito) * (tamanho + 1 - indice), 0);
      const resto = (soma * 10) % 11;
      return resto === 10 ? 0 : resto;
    };

    return calcularDigito(9) === Number(cpf[9]) && calcularDigito(10) === Number(cpf[10]);
  }

  voltarParaLogin(): void {
    this.router.navigate(['/login']);
  }
}
