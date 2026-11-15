import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { API_CONFIG } from '../../config';

export interface UsuarioBackend {
  id: number;
  first_name: string;
  last_name: string;
  cpf: string;
  telefone: string;
  is_sindico: boolean;
  endereco: {
    bloco: string;
    numero: string;
    codigo_registro: string;
  };
}

export interface EnderecoBackend {
  id: number;
  bloco: string;
  numero: string;
  andar?: string;
  codigo_registro: string;
  created_at: string;
}

@Component({
  selector: 'app-moradores',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  styleUrls: ['./moradores.css'],
  templateUrl: './moradores.html',
})
export class Moradores implements OnInit {
  moradores: UsuarioBackend[] = [];
  unidades: EnderecoBackend[] = [];
  codigoGerado = '';
  erroCadastro = '';
  mensagemSucesso = '';
  codigoCopiado = '';
  mostrarModalExclusao = false;
  moradorParaExcluir: UsuarioBackend | null = null;

  private apiUrlUsuarios = `${API_CONFIG.baseUrl}usuarios/`;
  private apiUrlEnderecos = `${API_CONFIG.baseUrl}enderecos/`;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.carregarMoradores();
    this.carregarUnidades();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  carregarMoradores(): void {
    this.http.get<UsuarioBackend[]>(this.apiUrlUsuarios, { headers: this.getHeaders() }).subscribe({
      next: (dados) => {
        this.moradores = dados.filter(u => !u.is_sindico);
      },
      error: () => {
        this.erroCadastro = 'Erro ao carregar lista de moradores.';
      }
    });
  }

  carregarUnidades(): void {
    this.http.get<EnderecoBackend[]>(this.apiUrlEnderecos, { headers: this.getHeaders() }).subscribe({
      next: (dados) => {
        this.unidades = dados;
      },
      error: () => {
        console.error('Erro ao carregar unidades');
      }
    });
  }

  cadastrarEndereco(bloco: string, apartamento: string): void {
    if (bloco.trim() === '' || apartamento.trim() === '') {
      this.erroCadastro = 'Preencha bloco e apartamento para gerar o código.';
      this.codigoGerado = '';
      return;
    }

    const body = {
      bloco: bloco.trim(),
      numero: apartamento.trim()
    };

    this.http.post<any>(this.apiUrlEnderecos, body, { headers: this.getHeaders() }).subscribe({
      next: (resposta) => {
        this.codigoGerado = resposta.codigo_registro;
        this.mensagemSucesso = 'Unidade cadastrada com sucesso!';
        this.erroCadastro = '';
        this.carregarUnidades();
      },
      error: () => {
        this.erroCadastro = 'Erro ao gerar o endereço. Verifique se ele já existe.';
        this.codigoGerado = '';
        this.mensagemSucesso = '';
      }
    });
  }

  copiarCodigo(codigo: string): void {
    navigator.clipboard.writeText(codigo);
    this.codigoCopiado = codigo;
    setTimeout(() => {
      if (this.codigoCopiado === codigo) {
        this.codigoCopiado = '';
      }
    }, 2500);
  }

  pedirExclusao(morador: UsuarioBackend) {
    this.moradorParaExcluir = morador;
    this.mostrarModalExclusao = true;
  }

  cancelarExclusao() {
    this.mostrarModalExclusao = false;
    this.moradorParaExcluir = null;
  }

  confirmarExclusao() {
    if (this.moradorParaExcluir === null) return;

    this.http.delete(`${this.apiUrlUsuarios}${this.moradorParaExcluir.id}/`, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.mensagemSucesso = `${this.moradorParaExcluir?.first_name} foi excluído do sistema.`;
        this.codigoGerado = '';
        this.erroCadastro = '';
        this.carregarMoradores();
        this.cancelarExclusao();
      },
      error: () => {
        this.erroCadastro = 'Erro ao excluir o morador.';
        this.cancelarExclusao();
      }
    });
  }
}
