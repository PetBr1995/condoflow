import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

export interface CommandItem {
  id: string;
  titulo: string;
  descricao?: string;
  categoria: 'Ações Rápidas' | 'Portaria & Segurança' | 'Navegação';
  icone: string;
  rota?: string;
  acao?: () => void;
}

@Component({
  selector: 'app-command-palette',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './command-palette.component.html',
  styleUrl: './command-palette.component.css'
})
export class CommandPaletteComponent {
  visivel: boolean = false;
  termoBusca: string = '';
  indiceSelecionado: number = 0;

  @ViewChild('inputBusca') inputBusca?: ElementRef<HTMLInputElement>;

  itens: CommandItem[] = [
    // Ações Rápidas
    {
      id: 'novo-convite',
      titulo: 'Gerar Convite para Visitante',
      descricao: 'Criar link seguro com QR Code e pré-cadastro',
      categoria: 'Ações Rápidas',
      icone: 'person_add',
      rota: '/acessos'
    },
    {
      id: 'receber-encomenda',
      titulo: 'Registrar Encomenda na Portaria',
      descricao: 'Dar entrada em pacote recebido para morador',
      categoria: 'Ações Rápidas',
      icone: 'inventory_2',
      rota: '/encomendas'
    },
    {
      id: 'novo-comunicado',
      titulo: 'Publicar Comunicado no Mural',
      descricao: 'Emitir informativo oficial para todos os condôminos',
      categoria: 'Ações Rápidas',
      icone: 'campaign',
      rota: '/avisos'
    },
    {
      id: 'nova-reserva',
      titulo: 'Reservar Área Comum',
      descricao: 'Agendar churrasqueira, salão de festas ou quadra',
      categoria: 'Ações Rápidas',
      icone: 'event_available',
      rota: '/reservas'
    },
    {
      id: 'novo-chamado',
      titulo: 'Abrir Chamado de Manutenção',
      descricao: 'Reportar problema elétrico, hidráulico ou predial',
      categoria: 'Ações Rápidas',
      icone: 'handyman',
      rota: '/chamados'
    },

    // Portaria & Segurança
    {
      id: 'totem-ao-vivo',
      titulo: 'Abrir Câmera do Totem da Portaria',
      descricao: 'Acompanhar scanner facial e fluxo de pedestres ao vivo',
      categoria: 'Portaria & Segurança',
      icone: 'videocam',
      rota: '/acessos'
    },
    {
      id: 'minha-face',
      titulo: 'Minha Biometria Facial',
      descricao: 'Visualizar ou atualizar selfie cadastrada',
      categoria: 'Portaria & Segurança',
      icone: 'face',
      rota: '/acessos'
    },

    // Navegação Global
    {
      id: 'nav-dashboard',
      titulo: 'Dashboard Geral',
      descricao: 'Painel com métricas, ocupação e gráficos',
      categoria: 'Navegação',
      icone: 'dashboard',
      rota: '/dashboard'
    },
    {
      id: 'nav-moradores',
      titulo: 'Cadastro de Moradores & Unidades',
      descricao: 'Lista completa de apartamentos, blocos e condôminos',
      categoria: 'Navegação',
      icone: 'groups',
      rota: '/moradores'
    },
    {
      id: 'nav-encomendas',
      titulo: 'Controle de Encomendas & Pacotes',
      descricao: 'Lista de entregas pendentes e retiradas',
      categoria: 'Navegação',
      icone: 'local_shipping',
      rota: '/encomendas'
    },
    {
      id: 'nav-documentos',
      titulo: 'Atas & Documentos Oficiais',
      descricao: 'Regimento interno, atas de assembleia e balancetes',
      categoria: 'Navegação',
      icone: 'description',
      rota: '/documentos'
    },
    {
      id: 'nav-enquetes',
      titulo: 'Assembleias Virtuais & Votações',
      descricao: 'Consultas ativas e enquetes de melhorias',
      categoria: 'Navegação',
      icone: 'how_to_vote',
      rota: '/enquetes'
    }
  ];

  constructor(
    private router: Router,
    public authService: AuthService
  ) {}

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.toggle();
      return;
    }

    if (!this.visivel) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      this.fechar();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      const total = this.itensFiltrados.length;
      if (total > 0) {
        this.indiceSelecionado = (this.indiceSelecionado + 1) % total;
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const total = this.itensFiltrados.length;
      if (total > 0) {
        this.indiceSelecionado = (this.indiceSelecionado - 1 + total) % total;
      }
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const selecionado = this.itensFiltrados[this.indiceSelecionado];
      if (selecionado) {
        this.executar(selecionado);
      }
    }
  }

  get itensFiltrados(): CommandItem[] {
    const q = this.termoBusca.trim().toLowerCase();
    if (!q) return this.itens;
    return this.itens.filter(item => 
      item.titulo.toLowerCase().includes(q) ||
      (item.descricao && item.descricao.toLowerCase().includes(q)) ||
      item.categoria.toLowerCase().includes(q)
    );
  }

  abrir(): void {
    this.visivel = true;
    this.termoBusca = '';
    this.indiceSelecionado = 0;
    setTimeout(() => {
      this.inputBusca?.nativeElement.focus();
    }, 50);
  }

  fechar(): void {
    this.visivel = false;
    this.termoBusca = '';
  }

  toggle(): void {
    if (this.visivel) {
      this.fechar();
    } else {
      this.abrir();
    }
  }

  executar(item: CommandItem): void {
    this.fechar();
    if (item.acao) {
      item.acao();
    } else if (item.rota) {
      this.router.navigate([item.rota]);
    }
  }
}
