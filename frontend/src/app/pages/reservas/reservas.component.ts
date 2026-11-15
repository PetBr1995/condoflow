import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ReservasService, AreaComum, Reserva } from '../../services/reservas.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './reservas.component.html',
  styleUrl: './reservas.component.css'
})
export class ReservasComponent implements OnInit {
  areas: AreaComum[] = [];
  reservas: Reserva[] = [];
  filtroStatus: string = 'todas';

  // Formulário de Nova Reserva
  mostrarFormulario: boolean = false;
  areaSelecionadaId: number | null = null;
  dataReserva: string = '';
  periodoSelecionado: string = 'dia_inteiro';
  observacoes: string = '';

  carregando: boolean = false;
  mensagemSucesso: string = '';
  mensagemErro: string = '';

  constructor(
    public reservasService: ReservasService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.carregarDados();
    // Preenche com a data de amanhã por padrão
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    this.dataReserva = amanha.toISOString().split('T')[0];
  }

  carregarDados(): void {
    this.carregando = true;
    this.reservasService.getAreasComuns().subscribe({
      next: (areas) => {
        this.areas = areas;
        if (areas.length > 0 && !this.areaSelecionadaId) {
          this.areaSelecionadaId = areas[0].id;
        }
      },
      error: (err) => console.error(err)
    });

    this.reservasService.getReservas().subscribe({
      next: (reservas) => {
        this.reservas = reservas;
        this.carregando = false;
      },
      error: (err) => {
        console.error(err);
        this.carregando = false;
      }
    });
  }

  reservasFiltradas(): Reserva[] {
    if (this.filtroStatus === 'todas') return this.reservas;
    return this.reservas.filter(r => r.status === this.filtroStatus);
  }

  solicitarReserva(): void {
    if (!this.areaSelecionadaId || !this.dataReserva) {
      this.mensagemErro = 'Selecione o espaço e a data desejada.';
      return;
    }

    this.mensagemErro = '';
    this.mensagemSucesso = '';

    this.reservasService.solicitarReserva({
      area_comum: this.areaSelecionadaId,
      data_reserva: this.dataReserva,
      periodo: this.periodoSelecionado,
      observacoes: this.observacoes
    }).subscribe({
      next: (reserva) => {
        this.mensagemSucesso = `Reserva solicitada com sucesso para ${reserva.area_nome}! Aguarde aprovação da administração.`;
        this.mostrarFormulario = false;
        this.observacoes = '';
        this.carregarDados();
      },
      error: (err) => {
        const erroMsg = err.error?.data_reserva?.[0] || err.error?.detail || 'Erro ao solicitar reserva.';
        this.mensagemErro = erroMsg;
      }
    });
  }

  aprovar(id: number): void {
    this.reservasService.aprovarReserva(id).subscribe({
      next: () => {
        this.carregarDados();
      },
      error: (err) => alert('Erro ao aprovar reserva.')
    });
  }

  rejeitar(id: number): void {
    const motivo = prompt('Informe o motivo da rejeição (opcional):') || 'Data indisponível';
    this.reservasService.rejeitarReserva(id, motivo).subscribe({
      next: () => {
        this.carregarDados();
      },
      error: (err) => alert('Erro ao rejeitar reserva.')
    });
  }

  cancelar(id: number): void {
    if (confirm('Tem certeza de que deseja cancelar esta reserva?')) {
      this.reservasService.cancelarReserva(id).subscribe({
        next: () => {
          this.carregarDados();
        },
        error: (err) => alert('Erro ao cancelar reserva.')
      });
    }
  }
}
