import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AcessosService, ConvitePublico } from '../../services/acessos.service';

@Component({
  selector: 'app-convite-publico',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './convite-publico.component.html',
  styleUrl: './convite-publico.component.css'
})
export class ConvitePublicoComponent implements OnInit, OnDestroy {
  @ViewChild('videoRef') videoRef!: ElementRef<HTMLVideoElement>;

  token: string = '';
  convite: ConvitePublico | null = null;
  carregando: boolean = true;
  mensagemErro: string = '';
  mensagemSucesso: string = '';

  // Controle de Câmera
  cameraAtiva: boolean = false;
  fotoCapturada: string = '';
  processandoFoto: boolean = false;
  stream: MediaStream | null = null;

  constructor(
    private route: ActivatedRoute,
    private acessosService: AcessosService
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    if (!this.token) {
      this.mensagemErro = 'Código de convite não encontrado na URL.';
      this.carregando = false;
      return;
    }
    this.carregarConvite();
  }

  ngOnDestroy(): void {
    this.pararCamera();
  }

  carregarConvite(): void {
    this.carregando = true;
    this.acessosService.getConvitePublico(this.token).subscribe({
      next: (dados) => {
        this.convite = dados;
        this.carregando = false;
      },
      error: (err) => {
        this.mensagemErro = err.error?.erro || 'Convite inválido ou expirado.';
        this.carregando = false;
      }
    });
  }

  async iniciarCamera(): Promise<void> {
    this.mensagemErro = '';
    this.fotoCapturada = '';
    this.cameraAtiva = true;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false
      });
      setTimeout(() => {
        if (this.videoRef && this.videoRef.nativeElement) {
          this.videoRef.nativeElement.srcObject = this.stream;
        }
      }, 100);
    } catch (err: any) {
      this.cameraAtiva = false;
      this.mensagemErro = 'Não foi possível acessar a câmera do seu celular. Por favor, autorize a permissão no navegador.';
    }
  }

  pararCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
    this.cameraAtiva = false;
  }

  capturarFoto(): void {
    if (!this.videoRef || !this.videoRef.nativeElement) return;
    const video = this.videoRef.nativeElement;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 640;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      this.fotoCapturada = canvas.toDataURL('image/jpeg', 0.85);
      this.pararCamera();
    }
  }

  recapturar(): void {
    this.fotoCapturada = '';
    this.mensagemErro = '';
    this.iniciarCamera();
  }

  enviarSelfie(): void {
    if (!this.fotoCapturada) {
      this.mensagemErro = 'Tire a foto antes de confirmar.';
      return;
    }

    this.processandoFoto = true;
    this.mensagemErro = '';

    this.acessosService.salvarSelfieConvite(this.token, this.fotoCapturada).subscribe({
      next: (resp) => {
        this.mensagemSucesso = 'Sua selfie foi validada e cadastrada com sucesso! Ao chegar à portaria, olhe para a câmera para liberar seu acesso.';
        this.processandoFoto = false;
        if (this.convite) {
          this.convite.tem_biometria = true;
        }
      },
      error: (err) => {
        this.mensagemErro = err.error?.erro || 'Não foi possível reconhecer o rosto. Certifique-se de estar em um local bem iluminado e tente novamente.';
        this.processandoFoto = false;
      }
    });
  }
}
