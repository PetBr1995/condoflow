import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AcessosService, MinhaFaceStatus, Visitante, ResultadoIdentificacao, RegistroAcesso } from '../../services/acessos.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-acessos',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './acessos.component.html',
  styleUrl: './acessos.component.css'
})
export class AcessosComponent implements OnInit, OnDestroy {
  @ViewChild('videoFacialRef') videoFacialRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('videoTotemRef') videoTotemRef!: ElementRef<HTMLVideoElement>;

  // Aba ativa: 'facial' (morador), 'visitantes' (gestão de visitas), 'totem' (câmera da portaria)
  abaAtiva: 'facial' | 'visitantes' | 'totem' = 'facial';

  // Mensagens globais
  mensagemSucesso: string = '';
  mensagemErro: string = '';
  carregando: boolean = false;

  // --- 1. BIOMETRIA FACIAL DO MORADOR ---
  minhaFace: MinhaFaceStatus = { tem_biometria: false };
  cameraFacialAtiva: boolean = false;
  streamFacial: MediaStream | null = null;
  fotoFacialCapturada: string = '';
  processandoFacial: boolean = false;

  // --- 2. VISITANTES E CONVITES ---
  visitantes: Visitante[] = [];
  filtroVisitantes: string = 'todos';
  mostrarFormVisitante: boolean = false;
  novoNome: string = '';
  novoDocumento: string = '';
  novoTelefone: string = '';
  novoTipo: 'visitante' | 'prestador' | 'delivery' = 'visitante';
  novaEmpresa: string = '';
  novaDataInicio: string = '';
  novaDataFim: string = '';
  novoPeriodo: 'dia_inteiro' | 'comercial' | 'manha' | 'tarde' | 'noite' = 'dia_inteiro';
  novasObservacoes: string = '';

  // --- 3. TERMINAL / TOTEM DA PORTARIA (AO VIVO) ---
  cameraTotemAtiva: boolean = false;
  streamTotem: MediaStream | null = null;
  analisandoFaceTotem: boolean = false;
  ultimoAcessoTotem: ResultadoIdentificacao | null = null;
  historicoAcessos: RegistroAcesso[] = [];
  intervaloTotem: any = null;
  totemAutoScan: boolean = false;

  constructor(
    public acessosService: AcessosService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    const hoje = new Date().toISOString().split('T')[0];
    this.novaDataInicio = hoje;
    this.novaDataFim = hoje;

    // Se for síndico, inicia por padrão no Totem ou Visitantes; se morador, na Biometria Facial
    if (this.authService.isSindico) {
      this.abaAtiva = 'visitantes';
    } else {
      this.abaAtiva = 'facial';
    }

    this.carregarDadosIniciais();
  }

  ngOnDestroy(): void {
    this.pararCameraFacial();
    this.pararCameraTotem();
  }

  mudarAba(aba: 'facial' | 'visitantes' | 'totem'): void {
    this.abaAtiva = aba;
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    if (aba !== 'facial') {
      this.pararCameraFacial();
    }
    if (aba !== 'totem') {
      this.pararCameraTotem();
    }

    if (aba === 'facial') {
      this.carregarMinhaFace();
    } else if (aba === 'visitantes') {
      this.carregarVisitantes();
    } else if (aba === 'totem') {
      this.carregarHistoricoTotem();
    }
  }

  carregarDadosIniciais(): void {
    this.carregarMinhaFace();
    this.carregarVisitantes();
    if (this.authService.isSindico) {
      this.carregarHistoricoTotem();
    }
  }

  // ===========================================================================
  // 1. BIOMETRIA FACIAL DO MORADOR
  // ===========================================================================

  carregarMinhaFace(): void {
    this.acessosService.getMinhaFace().subscribe({
      next: (dados) => this.minhaFace = dados,
      error: () => console.log('Sem biometria facial prévia.')
    });
  }

  async iniciarCameraFacial(): Promise<void> {
    this.mensagemErro = '';
    this.mensagemSucesso = '';
    this.fotoFacialCapturada = '';
    this.cameraFacialAtiva = true;

    try {
      this.streamFacial = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false
      });
      setTimeout(() => {
        if (this.videoFacialRef && this.videoFacialRef.nativeElement) {
          this.videoFacialRef.nativeElement.srcObject = this.streamFacial;
        }
      }, 100);
    } catch (err: any) {
      this.cameraFacialAtiva = false;
      this.mensagemErro = 'Não foi possível acessar a câmera frontal. Verifique as permissões de vídeo no navegador.';
    }
  }

  pararCameraFacial(): void {
    if (this.streamFacial) {
      this.streamFacial.getTracks().forEach(t => t.stop());
      this.streamFacial = null;
    }
    this.cameraFacialAtiva = false;
  }

  capturarSelfieMorador(): void {
    if (!this.videoFacialRef || !this.videoFacialRef.nativeElement) return;
    const video = this.videoFacialRef.nativeElement;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 640;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      this.fotoFacialCapturada = canvas.toDataURL('image/jpeg', 0.85);
      this.pararCameraFacial();
    }
  }

  recapturarSelfieMorador(): void {
    this.fotoFacialCapturada = '';
    this.iniciarCameraFacial();
  }

  salvarBiometriaMorador(): void {
    if (!this.fotoFacialCapturada) return;

    this.processandoFacial = true;
    this.mensagemErro = '';

    this.acessosService.cadastrarMinhaFace(this.fotoFacialCapturada).subscribe({
      next: (resp) => {
        this.mensagemSucesso = resp.mensagem || 'Biometria facial cadastrada com sucesso! Seu rosto está liberado na portaria.';
        this.fotoFacialCapturada = '';
        this.processandoFacial = false;
        this.carregarMinhaFace();
      },
      error: (err) => {
        this.mensagemErro = err.error?.erro || 'Erro ao processar biometria. Mantenha o rosto centralizado e em local bem iluminado.';
        this.processandoFacial = false;
      }
    });
  }

  removerBiometriaMorador(): void {
    if (!confirm('Deseja remover sua biometria facial? Você precisará cadastrar uma nova foto para ter acesso automático pelo totem da portaria.')) {
      return;
    }

    this.acessosService.removerMinhaFace().subscribe({
      next: () => {
        this.mensagemSucesso = 'Biometria facial removida.';
        this.minhaFace = { tem_biometria: false };
      },
      error: () => alert('Erro ao remover biometria.')
    });
  }

  // ===========================================================================
  // 2. GESTÃO DE VISITANTES E PRESTADORES
  // ===========================================================================

  carregarVisitantes(): void {
    this.acessosService.getVisitantes().subscribe({
      next: (dados) => this.visitantes = dados,
      error: () => console.error('Erro ao buscar visitantes.')
    });
  }

  visitantesFiltrados(): Visitante[] {
    if (this.filtroVisitantes === 'todos') return this.visitantes;
    if (this.filtroVisitantes === 'com_facial') return this.visitantes.filter(v => v.tem_biometria);
    if (this.filtroVisitantes === 'sem_facial') return this.visitantes.filter(v => !v.tem_biometria);
    return this.visitantes.filter(v => v.tipo === this.filtroVisitantes);
  }

  cadastrarVisitante(): void {
    if (!this.novoNome.trim() || !this.novaDataInicio || !this.novaDataFim) {
      this.mensagemErro = 'Preencha o nome do visitante e as datas de início e término.';
      return;
    }

    this.carregando = true;
    this.acessosService.criarVisitante({
      nome: this.novoNome.trim(),
      documento: this.novoDocumento.trim(),
      telefone: this.novoTelefone.trim(),
      tipo: this.novoTipo,
      empresa: this.novaEmpresa.trim(),
      data_inicio: this.novaDataInicio,
      data_fim: this.novaDataFim,
      periodo: this.novoPeriodo,
      observacoes: this.novasObservacoes.trim()
    }).subscribe({
      next: (resp) => {
        this.mensagemSucesso = `Autorização criada para ${resp.nome}! Você já pode compartilhar o link para ele tirar a selfie.`;
        this.mostrarFormVisitante = false;
        this.novoNome = '';
        this.novoDocumento = '';
        this.novoTelefone = '';
        this.novaEmpresa = '';
        this.novasObservacoes = '';
        this.carregando = false;
        this.carregarVisitantes();
      },
      error: (err) => {
        this.mensagemErro = err.error?.detail || 'Erro ao cadastrar visitante.';
        this.carregando = false;
      }
    });
  }

  copiarLinkWhatsApp(visitante: Visitante): void {
    const urlAtual = window.location.origin;
    const linkConvite = `${urlAtual}/convite/${visitante.codigo_acesso}`;
    const textoMensagem = `Olá, ${visitante.nome}! Você foi autorizado(a) a entrar no ${this.authService.condominioNome || 'Condomínio'}. Para liberar seu acesso na portaria facial sem filas, tire uma selfie rápida pelo link: ${linkConvite}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(textoMensagem).then(() => {
        this.mensagemSucesso = `Link do WhatsApp para ${visitante.nome} copiado para a área de transferência!`;
      });
    }

    const urlWhatsapp = `https://api.whatsapp.com/send?text=${encodeURIComponent(textoMensagem)}`;
    window.open(urlWhatsapp, '_blank');
  }

  excluirVisitante(id: number): void {
    if (confirm('Deseja cancelar a autorização deste visitante?')) {
      this.acessosService.excluirVisitante(id).subscribe({
        next: () => {
          this.mensagemSucesso = 'Autorização cancelada.';
          this.carregarVisitantes();
        },
        error: () => alert('Erro ao excluir.')
      });
    }
  }

  // ===========================================================================
  // 3. TERMINAL / TOTEM DA PORTARIA (CÂMERA AO VIVO)
  // ===========================================================================

  carregarHistoricoTotem(): void {
    this.acessosService.getHistoricoAcessos().subscribe({
      next: (dados) => this.historicoAcessos = dados,
      error: () => console.log('Histórico não disponível.')
    });
  }

  async iniciarTotem(): Promise<void> {
    this.cameraTotemAtiva = true;
    this.mensagemErro = '';

    try {
      this.streamTotem = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      });
      setTimeout(() => {
        if (this.videoTotemRef && this.videoTotemRef.nativeElement) {
          this.videoTotemRef.nativeElement.srcObject = this.streamTotem;
        }
      }, 100);
    } catch (err: any) {
      this.cameraTotemAtiva = false;
      this.mensagemErro = 'Não foi possível ligar a câmera do totem da portaria. Verifique as permissões de vídeo.';
    }
  }

  pararCameraTotem(): void {
    if (this.intervaloTotem) {
      clearInterval(this.intervaloTotem);
      this.intervaloTotem = null;
    }
    this.totemAutoScan = false;
    if (this.streamTotem) {
      this.streamTotem.getTracks().forEach(t => t.stop());
      this.streamTotem = null;
    }
    this.cameraTotemAtiva = false;
  }

  toggleAutoScan(): void {
    this.totemAutoScan = !this.totemAutoScan;
    if (this.totemAutoScan) {
      this.intervaloTotem = setInterval(() => {
        if (!this.analisandoFaceTotem && this.cameraTotemAtiva) {
          this.analisarFaceAoVivo();
        }
      }, 2500); // Analisa a cada 2.5s
    } else {
      if (this.intervaloTotem) {
        clearInterval(this.intervaloTotem);
        this.intervaloTotem = null;
      }
    }
  }

  analisarFaceAoVivo(): void {
    if (!this.videoTotemRef || !this.videoTotemRef.nativeElement) return;
    const video = this.videoTotemRef.nativeElement;

    if (video.readyState < 2) return;

    this.analisandoFaceTotem = true;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      this.analisandoFaceTotem = false;
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const frameBase64 = canvas.toDataURL('image/jpeg', 0.85);

    this.acessosService.identificarFacePortaria(frameBase64, 'Portão Principal Pedestres').subscribe({
      next: (resultado) => {
        this.ultimoAcessoTotem = resultado;
        this.analisandoFaceTotem = false;
        this.carregarHistoricoTotem();
      },
      error: () => {
        this.analisandoFaceTotem = false;
      }
    });
  }

  formatarDataBr(isoStr?: string): string {
    if (!isoStr) return '';
    const partes = isoStr.split('T')[0].split('-');
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return isoStr;
  }
}
