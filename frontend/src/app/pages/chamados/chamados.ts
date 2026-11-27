import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { API_CONFIG } from '../../config';

export interface Chamado {
  id: number;
  titulo: string;
  descricao: string;
  status: string;
  status_display?: string;
  categoria?: string;
  prioridade?: string;
  prioridade_display?: string;
  resposta_sindico?: string;
  foto?: string;
  autor: any;
  created_at: string;
}

@Component({
  selector: 'app-chamados',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  styleUrls: ['./chamados.css'],
  templateUrl: './chamados.html',
})
export class Chamados implements OnInit {
  chamados: Chamado[] = [];
  mensagemSucesso = '';
  mensagemErro = '';
  telaChamados = 'lista'; // 'lista' | 'novo' | 'detalhe'
  chamadoSelecionado: Chamado | null = null;
  novoStatusSelecionado: string = '';
  novaPrioridadeSelecionada: string = '';
  
  // Filtros e Busca (Design System)
  filtroStatus: string = 'todos'; // 'todos' | 'aberto' | 'em_andamento' | 'concluido'
  termoBusca: string = '';
  
  // Categorias disponíveis para abertura de chamados
  categorias = ['Manutenção', 'Elétrica', 'Hidráulica', 'Limpeza', 'Segurança', 'Reclamação / Barulho', 'Outros'];
  categoriaSelecionada = 'Manutenção';
  fotoSelecionada = '';
  fotoArquivoSelecionado: File | null = null;

  get perfil(): string {
    return this.isSindico ? 'sindico' : 'morador';
  }

  isSindico = false;
  usuarioLogado = '';

  // Controle de Modais
  modalAberto = false;
  acaoPendente = '';
  chamadoParaConfirmar: Chamado | null = null;

  private apiUrl = `${API_CONFIG.baseUrl}chamados/`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.isSindico = this.authService.isSindico;
    this.usuarioLogado = localStorage.getItem('username') || '';
    this.carregarChamados();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  carregarChamados(): void {
    this.http.get<Chamado[]>(this.apiUrl, { headers: this.getHeaders() }).subscribe({
      next: (dados) => {
        this.chamados = dados;
      },
      error: () => {
        this.mensagemErro = 'Erro ao carregar chamados do condomínio.';
      }
    });
  }

  chamadosDoMorador(): Chamado[] {
    return this.chamados;
  }

  chamadosFiltrados(): Chamado[] {
    let lista = this.chamados;
    
    // Filtro por status
    if (this.filtroStatus !== 'todos') {
      lista = lista.filter(c => c.status === this.filtroStatus);
    }

    // Filtro por termo de busca (título, id ou descrição)
    if (this.termoBusca && this.termoBusca.trim() !== '') {
      const termo = this.termoBusca.toLowerCase().trim();
      lista = lista.filter(c => 
        (c.titulo && c.titulo.toLowerCase().includes(termo)) || 
        c.id.toString().includes(termo) ||
        (c.descricao && c.descricao.toLowerCase().includes(termo))
      );
    }

    return lista;
  }

  countStatus(status: string): number {
    if (status === 'todos') return this.chamados.length;
    return this.chamados.filter(c => c.status === status).length;
  }

  getStatusLabel(status: string): string {
    const s = (status || '').toLowerCase();
    if (s === 'aberto') return 'Aberto';
    if (s === 'em_andamento') return 'Em andamento';
    if (s === 'concluido') return 'Finalizado';
    if (s === 'cancelado') return 'Cancelado';
    return status;
  }

  // Helpers de Apresentação do Design System
  getIconeCategoria(categoria?: string): string {
    const cat = (categoria || '').toLowerCase();
    if (cat.includes('elétr') || cat.includes('luz') || cat.includes('lâmpada')) return 'lightbulb';
    if (cat.includes('hidrául') || cat.includes('cano') || cat.includes('vazamento')) return 'water_drop';
    if (cat.includes('limp')) return 'cleaning_services';
    if (cat.includes('seguran')) return 'shield';
    if (cat.includes('barulho') || cat.includes('reclam')) return 'campaign';
    return 'build'; // padrão: chave inglesa elegante
  }

  getLocalChamado(chamado: Chamado): string {
    if (chamado.autor?.endereco?.bloco) {
      return `Bloco ${chamado.autor.endereco.bloco}`;
    }
    if (chamado.autor?.is_sindico) {
      return 'Administração';
    }
    return 'Área Comum';
  }

  getPrioridadeLabel(prioridade?: string): string {
    const prio = (prioridade || '').toLowerCase();
    if (prio === 'alta') return 'Alta';
    if (prio === 'urgente') return 'Urgente';
    if (prio === 'baixa') return 'Baixa';
    return 'Média';
  }

  adicionarChamado(tituloInput: HTMLInputElement, descricaoInput: HTMLTextAreaElement): void {
    const titulo = tituloInput.value.trim();
    const descricao = descricaoInput.value.trim();

    if (titulo === '' || titulo.length > 80 || descricao === '') {
      this.mensagemSucesso = '';
      this.mensagemErro = 'Informe um título de até 80 caracteres e descreva o problema.';
      return;
    }

    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('descricao', descricao);
    formData.append('status', 'aberto');
    formData.append('categoria', this.categoriaSelecionada || 'Outros');
    if (this.fotoArquivoSelecionado) {
      formData.append('foto', this.fotoArquivoSelecionado);
    }

    this.http.post(this.apiUrl, formData, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.mensagemSucesso = 'Chamado criado com sucesso!';
        this.mensagemErro = '';
        tituloInput.value = '';
        descricaoInput.value = '';
        this.categoriaSelecionada = 'Manutenção';
        this.fotoSelecionada = '';
        this.fotoArquivoSelecionado = null;
        this.telaChamados = 'lista';
        this.carregarChamados();
      },
      error: (err) => {
        const erroMsg = err.error?.detail || err.error?.categoria?.[0] || 'Erro ao criar chamado.';
        this.mensagemErro = erroMsg;
      }
    });
  }

  abrirNovoChamado(): void {
    this.mensagemErro = '';
    this.mensagemSucesso = '';
    this.telaChamados = 'novo';
  }

  cancelarNovoChamado(): void {
    this.mensagemErro = '';
    this.telaChamados = 'lista';
  }

  selecionarChamado(chamado: Chamado): void {
    this.chamadoSelecionado = chamado;
    this.novoStatusSelecionado = chamado.status;
    this.novaPrioridadeSelecionada = chamado.prioridade || 'media';
    this.telaChamados = 'detalhe';
  }

  fecharDetalhe(): void {
    this.chamadoSelecionado = null;
    this.telaChamados = 'lista';
  }

  selecionarNovoStatus(status: string): void {
    this.novoStatusSelecionado = status;
  }

  selecionarNovaPrioridade(prioridade: string): void {
    this.novaPrioridadeSelecionada = prioridade;
  }

  salvarAlteracaoStatus(): void {
    if (!this.isSindico || !this.chamadoSelecionado) return;

    const body = {
      status: this.novoStatusSelecionado,
      prioridade: this.novaPrioridadeSelecionada
    };

    this.http.patch(`${this.apiUrl}${this.chamadoSelecionado.id}/`, body, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.mensagemSucesso = 'Chamado atualizado com sucesso!';
        this.carregarChamados();
        this.fecharDetalhe();
      },
      error: () => {
        this.mensagemErro = 'Erro ao atualizar chamado.';
      }
    });
  }

  resolver(chamado: Chamado): void {
    if (!this.isSindico || chamado.status !== 'aberto') return;

    this.http.patch(`${this.apiUrl}${chamado.id}/`, { status: 'concluido' }, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.mensagemSucesso = 'Chamado marcado como concluído.';
        this.carregarChamados();
      },
      error: () => {
        this.mensagemErro = 'Erro ao resolver chamado.';
      }
    });
  }

  removerChamado(chamado: Chamado): void {
    this.http.delete(`${this.apiUrl}${chamado.id}/`, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.mensagemSucesso = 'Chamado excluído com sucesso.';
        if (this.chamadoSelecionado === chamado) {
          this.fecharDetalhe();
        }
        this.carregarChamados();
      },
      error: () => {
        this.mensagemErro = 'Erro ao excluir chamado.';
      }
    });
  }

  pedirConfirmacao(acao: string, chamado: Chamado) {
    this.acaoPendente = acao;
    this.chamadoParaConfirmar = chamado;
    this.modalAberto = true;
  }

  cancelarConfirmacao() {
    this.modalAberto = false;
    this.acaoPendente = '';
    this.chamadoParaConfirmar = null;
  }

  confirmarAcao() {
    if (this.chamadoParaConfirmar === null) return;
    if (this.acaoPendente === 'resolver') {
      this.resolver(this.chamadoParaConfirmar);
    }
    if (this.acaoPendente === 'excluir') {
      this.removerChamado(this.chamadoParaConfirmar);
    }
    this.cancelarConfirmacao();
  }

  selecionarCategoria(categoria: string) {
    this.categoriaSelecionada = categoria;
  }

  selecionarFoto(input: HTMLInputElement) {
    if (input.files && input.files[0]) {
      this.fotoArquivoSelecionado = input.files[0];
      this.fotoSelecionada = input.files[0].name;
    } else {
      this.fotoArquivoSelecionado = null;
      this.fotoSelecionada = '';
    }
  }

  ajustarAlturaDescricao(el: HTMLTextAreaElement) {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }
}
