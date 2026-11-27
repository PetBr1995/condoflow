import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { EncomendasService, Encomenda } from '../../services/encomendas.service';
import { AuthService } from '../../services/auth.service';
import { API_CONFIG } from '../../config';

@Component({
  selector: 'app-encomendas',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './encomendas.component.html',
  styleUrl: './encomendas.component.css'
})
export class EncomendasComponent implements OnInit {
  encomendas: Encomenda[] = [];
  unidades: any[] = [];
  filtroStatus: string = 'todas';
  termoBuscaLista: string = '';
  buscaUnidadeForm: string = '';

  carregando: boolean = true;
  salvando: boolean = false;
  dandoBaixaId: number | null = null;

  mostrarFormulario: boolean = false;
  enderecoSelecionadoId: number | null = null;
  empresaEntrega: string = 'Mercado Livre';
  descricao: string = 'Pacote / Caixa';
  codigoRastreio: string = '';

  empresasDisponiveis = ['Mercado Livre', 'Amazon', 'Correios', 'Shopee', 'Magalu', 'Sedex', 'Outra'];

  mensagemSucesso: string = '';
  mensagemErro: string = '';
  codigoCopiadoId: number | null = null;

  constructor(
    public encomendasService: EncomendasService,
    public authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.carregarEncomendas();
    if (this.authService.isSindico) {
      this.carregarUnidades();
    }
  }

  carregarEncomendas(): void {
    this.carregando = true;
    this.encomendasService.getEncomendas().subscribe({
      next: (dados) => {
        this.encomendas = dados;
        this.carregando = false;
      },
      error: () => {
        this.mensagemErro = 'Não foi possível carregar as encomendas. Verifique sua conexão.';
        this.carregando = false;
      }
    });
  }

  carregarUnidades(): void {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    this.http.get<any[]>(`${API_CONFIG.baseUrl}enderecos/`, { headers }).subscribe({
      next: (unidades) => {
        this.unidades = unidades;
        if (unidades.length > 0 && !this.enderecoSelecionadoId) {
          this.enderecoSelecionadoId = unidades[0].id;
        }
      }
    });
  }

  unidadesFiltradas(): any[] {
    if (!this.buscaUnidadeForm.trim()) return this.unidades;
    const termo = this.buscaUnidadeForm.toLowerCase();
    return this.unidades.filter(u =>
      (u.bloco || '').toLowerCase().includes(termo) ||
      (u.numero || '').toLowerCase().includes(termo)
    );
  }

  encomendasFiltradas(): Encomenda[] {
    let lista = this.encomendas;

    if (this.filtroStatus !== 'todas') {
      lista = lista.filter(e => e.status === this.filtroStatus);
    }

    if (this.termoBuscaLista.trim()) {
      const termo = this.termoBuscaLista.toLowerCase();
      lista = lista.filter(e =>
        (e.numero || '').toLowerCase().includes(termo) ||
        (e.bloco || '').toLowerCase().includes(termo) ||
        (e.empresa_entrega || '').toLowerCase().includes(termo) ||
        (e.descricao || '').toLowerCase().includes(termo) ||
        (e.codigo_retirada || '').toLowerCase().includes(termo) ||
        (e.codigo_rastreio || '').toLowerCase().includes(termo)
      );
    }

    return lista;
  }

  totalAguardando(): number {
    return this.encomendas.filter(e => e.status === 'aguardando_retirada').length;
  }

  totalEntregues(): number {
    return this.encomendas.filter(e => e.status === 'entregue').length;
  }

  registrarChegada(): void {
    if (!this.enderecoSelecionadoId) {
      this.mensagemErro = 'Selecione a unidade de destino da encomenda.';
      return;
    }

    this.salvando = true;
    this.mensagemErro = '';

    this.encomendasService.registrarEncomenda({
      endereco: this.enderecoSelecionadoId,
      empresa_entrega: this.empresaEntrega,
      descricao: this.descricao,
      codigo_rastreio: this.codigoRastreio
    }).subscribe({
      next: (enc) => {
        this.mensagemSucesso = `Encomenda registrada com sucesso para ${enc.unidade_str}! Código de retirada: ${enc.codigo_retirada}`;
        this.mostrarFormulario = false;
        this.salvando = false;
        this.codigoRastreio = '';
        this.buscaUnidadeForm = '';
        this.carregarEncomendas();

        setTimeout(() => {
          this.mensagemSucesso = '';
        }, 5000);
      },
      error: () => {
        this.mensagemErro = 'Erro ao registrar encomenda. Verifique os dados e tente novamente.';
        this.salvando = false;
      }
    });
  }

  darBaixa(id: number): void {
    if (confirm('Confirmar a entrega do pacote ao morador?')) {
      this.dandoBaixaId = id;
      this.encomendasService.darBaixa(id).subscribe({
        next: () => {
          this.mensagemSucesso = 'Entrega confirmada com sucesso! O status foi atualizado.';
          this.dandoBaixaId = null;
          this.carregarEncomendas();

          setTimeout(() => {
            this.mensagemSucesso = '';
          }, 4000);
        },
        error: () => {
          this.dandoBaixaId = null;
          this.mensagemErro = 'Erro ao confirmar entrega.';
        }
      });
    }
  }

  copiarCodigo(codigo: string, id: number): void {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(codigo).then(() => {
        this.codigoCopiadoId = id;
        setTimeout(() => this.codigoCopiadoId = null, 2500);
      });
    }
  }

  getCarrierBrand(empresa: string): { classe: string, icone: string } {
    const nome = (empresa || '').toLowerCase();
    if (nome.includes('mercado livre')) {
      return { classe: 'brand-meli', icone: 'local_mall' };
    }
    if (nome.includes('amazon')) {
      return { classe: 'brand-amazon', icone: 'inventory' };
    }
    if (nome.includes('correios') || nome.includes('sedex')) {
      return { classe: 'brand-correios', icone: 'markunread_mailbox' };
    }
    if (nome.includes('shopee')) {
      return { classe: 'brand-shopee', icone: 'shopping_bag' };
    }
    if (nome.includes('magalu')) {
      return { classe: 'brand-magalu', icone: 'storefront' };
    }
    if (nome.includes('loggi')) {
      return { classe: 'brand-loggi', icone: 'moped' };
    }
    return { classe: 'brand-generica', icone: 'local_shipping' };
  }
}
