import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AcessosService, AutorizacaoAcesso } from '../../services/acessos.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-acessos',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './acessos.component.html',
  styleUrl: './acessos.component.css'
})
export class AcessosComponent implements OnInit {
  acessos: AutorizacaoAcesso[] = [];
  mostrarFormulario: boolean = false;
  filtroStatus: string = 'todos';

  nomeVisitante: string = '';
  documento: string = '';
  tipoAcesso: string = 'visitante';
  dataPrevista: string = '';
  placaVeiculo: string = '';
  observacoes: string = '';

  mensagemSucesso: string = '';
  mensagemErro: string = '';

  constructor(
    public acessosService: AcessosService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    const hoje = new Date().toISOString().split('T')[0];
    this.dataPrevista = hoje;
    this.carregarAcessos();
  }

  carregarAcessos(): void {
    this.acessosService.getAcessos().subscribe({
      next: (dados) => this.acessos = dados,
      error: () => this.mensagemErro = 'Erro ao carregar lista de acessos.'
    });
  }

  acessosFiltrados(): AutorizacaoAcesso[] {
    if (this.filtroStatus === 'todos') return this.acessos;
    return this.acessos.filter(a => a.status === this.filtroStatus);
  }

  liberarAcesso(): void {
    if (!this.nomeVisitante.trim() || !this.dataPrevista) {
      this.mensagemErro = 'Preencha o nome do visitante e a data prevista.';
      return;
    }

    this.acessosService.autorizarAcesso({
      nome_visitante: this.nomeVisitante.trim(),
      tipo: this.tipoAcesso,
      data_prevista: this.dataPrevista,
      documento: this.documento.trim(),
      placa_veiculo: this.placaVeiculo.trim(),
      observacoes: this.observacoes.trim()
    }).subscribe({
      next: (resp) => {
        this.mensagemSucesso = `Acesso pré-autorizado para ${resp.nome_visitante}! A portaria já foi notificada.`;
        this.mostrarFormulario = false;
        this.nomeVisitante = '';
        this.documento = '';
        this.placaVeiculo = '';
        this.observacoes = '';
        this.carregarAcessos();
      },
      error: (err) => {
        this.mensagemErro = err.error?.endereco?.[0] || 'Erro ao registrar autorização.';
      }
    });
  }

  registrarEntrada(id: number): void {
    this.acessosService.registrarEntrada(id).subscribe({
      next: () => {
        this.mensagemSucesso = 'Entrada confirmada na portaria!';
        this.carregarAcessos();
      },
      error: () => alert('Erro ao registrar entrada.')
    });
  }

  registrarSaida(id: number): void {
    this.acessosService.registrarSaida(id).subscribe({
      next: () => {
        this.mensagemSucesso = 'Saída registrada com sucesso!';
        this.carregarAcessos();
      },
      error: () => alert('Erro ao registrar saída.')
    });
  }

  cancelar(id: number): void {
    if (confirm('Deseja cancelar esta liberação de acesso?')) {
      this.acessosService.cancelar(id).subscribe({
        next: () => this.carregarAcessos(),
        error: () => alert('Erro ao cancelar autorização.')
      });
    }
  }
}
