import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config';

export interface Encomenda {
  id: number;
  endereco: number;
  unidade_str: string;
  bloco: string;
  numero: string;
  morador?: number;
  morador_nome?: string;
  empresa_entrega: string;
  codigo_rastreio?: string;
  codigo_retirada: string;
  descricao: string;
  status: 'aguardando_retirada' | 'entregue';
  status_display: string;
  recebido_por_nome?: string;
  data_recebimento: string;
  data_retirada?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EncomendasService {
  private apiUrl = `${API_CONFIG.baseUrl}encomendas/`;

  constructor(private http: HttpClient) {}

  getEncomendas(): Observable<Encomenda[]> {
    return this.http.get<Encomenda[]>(this.apiUrl);
  }

  registrarEncomenda(dados: { endereco: number; empresa_entrega: string; descricao?: string; codigo_rastreio?: string }): Observable<Encomenda> {
    return this.http.post<Encomenda>(this.apiUrl, dados);
  }

  darBaixa(id: number): Observable<Encomenda> {
    return this.http.post<Encomenda>(`${this.apiUrl}${id}/dar_baixa/`, {});
  }
}
