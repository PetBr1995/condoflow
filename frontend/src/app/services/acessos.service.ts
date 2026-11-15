import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config';

export interface AutorizacaoAcesso {
  id: number;
  endereco: number;
  unidade_str: string;
  bloco: string;
  numero: string;
  morador: number;
  morador_nome: string;
  nome_visitante: string;
  documento?: string;
  tipo: 'visitante' | 'prestador' | 'delivery';
  tipo_display: string;
  data_prevista: string;
  placa_veiculo?: string;
  observacoes?: string;
  status: 'autorizado' | 'no_condominio' | 'finalizado' | 'cancelado';
  status_display: string;
  data_entrada?: string;
  data_saida?: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class AcessosService {
  private apiUrl = `${API_CONFIG.baseUrl}acessos/`;

  constructor(private http: HttpClient) {}

  getAcessos(): Observable<AutorizacaoAcesso[]> {
    return this.http.get<AutorizacaoAcesso[]>(this.apiUrl);
  }

  autorizarAcesso(dados: { nome_visitante: string; tipo: string; data_prevista: string; documento?: string; placa_veiculo?: string; observacoes?: string }): Observable<AutorizacaoAcesso> {
    return this.http.post<AutorizacaoAcesso>(this.apiUrl, dados);
  }

  registrarEntrada(id: number): Observable<AutorizacaoAcesso> {
    return this.http.post<AutorizacaoAcesso>(`${this.apiUrl}${id}/registrar_entrada/`, {});
  }

  registrarSaida(id: number): Observable<AutorizacaoAcesso> {
    return this.http.post<AutorizacaoAcesso>(`${this.apiUrl}${id}/registrar_saida/`, {});
  }

  cancelar(id: number): Observable<AutorizacaoAcesso> {
    return this.http.post<AutorizacaoAcesso>(`${this.apiUrl}${id}/cancelar/`, {});
  }
}
