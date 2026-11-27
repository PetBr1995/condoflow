import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatRipple } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ChartChamadosComponent } from './components/chart-chamados/chart-chamados.component';
import { DashboardService, DashboardData } from './services/dashboard.service';
import { AuthService } from '../../services/auth.service';

interface AtividadeRecente {
  icone: string;
  titulo: string;
  subtitulo: string;
  data: string;
  status: string;
  tipoStatus: 'sucesso' | 'alerta' | 'pendente' | 'info';
}

interface ContatoEquipe {
  nome: string;
  cargo: string;
  iniciais: string;
  cor: string;
}

interface MetaManutencao {
  titulo: string;
  periodo: string;
  progresso: number;
  valorFormatado: string;
  cor: string;
}

interface CategoriaDemanda {
  nome: string;
  porcentagem: number;
  cor: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatRipple, MatIconModule, ChartChamadosComponent, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  estatisticas: DashboardData | null = null;
  carregando: boolean = true;
  erroCarregamento: boolean = false;
  filtroPeriodo: string = '7d';

  // Equipe & Portaria (Estilo Quick payment do ACRU)
  equipeContatos: ContatoEquipe[] = [
    { nome: 'Carlos', cargo: 'Síndico', iniciais: 'CS', cor: '#0f172a' },
    { nome: 'Portaria 24h', cargo: 'Recepção', iniciais: 'P1', cor: '#2563eb' },
    { nome: 'Marcos', cargo: 'Zeladoria', iniciais: 'MZ', cor: '#16a34a' },
    { nome: 'Valter', cargo: 'Manutenção', iniciais: 'VM', cor: '#d97706' },
    { nome: 'Segurança', cargo: 'Ronda', iniciais: 'SG', cor: '#475569' }
  ];

  // Atividades Recentes do Condomínio (Estilo Transaction history do ACRU)
  atividadesRecentes: AtividadeRecente[] = [
    {
      icone: 'local_shipping',
      titulo: 'Encomenda Mercado Livre',
      subtitulo: 'Apto 101 · Retirada liberada',
      data: 'Hoje, 11:20',
      status: 'Disponível',
      tipoStatus: 'sucesso'
    },
    {
      icone: 'build',
      titulo: 'Manutenção Bomba Hidráulica',
      subtitulo: 'Bloco A · Reparo técnico',
      data: 'Ontem, 16:45',
      status: 'Concluído',
      tipoStatus: 'sucesso'
    },
    {
      icone: 'event_available',
      titulo: 'Reserva Salão Gourmet',
      subtitulo: 'Apto 201 · Sab, 19:00',
      data: '25 Nov 2026',
      status: 'Aprovada',
      tipoStatus: 'info'
    },
    {
      icone: 'warning_amber',
      titulo: 'Lâmpada Estacionamento B2',
      subtitulo: 'Garagem · Troca solicitada',
      data: '24 Nov 2026',
      status: 'Em Análise',
      tipoStatus: 'alerta'
    },
    {
      icone: 'campaign',
      titulo: 'Limpeza de Caixas d\'Água',
      subtitulo: 'Aviso geral da administração',
      data: '22 Nov 2026',
      status: 'Oficial',
      tipoStatus: 'pendente'
    }
  ];

  // Metas de Manutenção Preventiva (Estilo Goal tracker do ACRU)
  metasManutencao: MetaManutencao[] = [
    {
      titulo: 'Revisão dos Elevadores',
      periodo: 'Trimestral · Em dia',
      progresso: 85,
      valorFormatado: '85%',
      cor: '#16a34a'
    },
    {
      titulo: 'Limpeza de Caixas d\'Água',
      periodo: 'Semestral · Previsto Dez',
      progresso: 60,
      valorFormatado: '60%',
      cor: '#d97706'
    },
    {
      titulo: 'Vistoria AVCB / Bombeiros',
      periodo: 'Anual · 9 meses restantes',
      progresso: 95,
      valorFormatado: '95%',
      cor: '#2563eb'
    }
  ];

  // Categorias de Chamados (Estilo Cost analysis do ACRU)
  categoriasOcorrencias: CategoriaDemanda[] = [
    { nome: 'Hidráulica', porcentagem: 32, cor: '#2563eb' },
    { nome: 'Elétrica', porcentagem: 24, cor: '#d97706' },
    { nome: 'Áreas Comuns', porcentagem: 18, cor: '#16a34a' },
    { nome: 'Segurança', porcentagem: 14, cor: '#0f172a' },
    { nome: 'Outros', porcentagem: 12, cor: '#94a3b8' }
  ];

  constructor(
    private dashboardService: DashboardService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.carregarDashboard();
  }

  setPeriodo(periodo: string): void {
    this.filtroPeriodo = periodo;
  }

  get taxaResolucaoGeral(): number {
    if (!this.estatisticas) return 78;
    const total = (this.estatisticas.chamados_abertos || 0) +
                  (this.estatisticas.chamados_andamento || 0) +
                  (this.estatisticas.chamados_concluidos || 0);
    if (total === 0) return 100;
    return Math.round(((this.estatisticas.chamados_concluidos || 0) / total) * 100);
  }

  get totalDemandas(): number {
    if (!this.estatisticas) return 0;
    return (this.estatisticas.chamados_abertos || 0) +
           (this.estatisticas.chamados_andamento || 0) +
           (this.estatisticas.chamados_concluidos || 0);
  }

  carregarDashboard(): void {
    this.carregando = true;
    this.erroCarregamento = false;

    this.dashboardService.getEstatisticas().subscribe({
      next: (dados) => {
        this.estatisticas = dados;
        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao buscar estatísticas do painel: ', erro);
        this.erroCarregamento = true;
        this.carregando = false;
      }
    });
  }
}
