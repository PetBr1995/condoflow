import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config';

export interface Enquete {
  id: number;
  titulo: string;
  descricao?: string;
  data_limite: string;
  ativa: boolean;
  opcao_1: string;
  opcao_2: string;
  opcao_3?: string;
  opcao_4?: string;
  total_votos: number;
  votos_opcao_1: number;
  votos_opcao_2: number;
  votos_opcao_3: number;
  votos_opcao_4: number;
  minha_opcao_votada?: number;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class EnquetesService {
  private apiUrl = `${API_CONFIG.baseUrl}enquetes/`;

  constructor(private http: HttpClient) {}

  getEnquetes(): Observable<Enquete[]> {
    return this.http.get<Enquete[]>(this.apiUrl);
  }

  criarEnquete(dados: { titulo: string; descricao?: string; data_limite: string; opcao_1: string; opcao_2: string; opcao_3?: string; opcao_4?: string }): Observable<Enquete> {
    return this.http.post<Enquete>(this.apiUrl, dados);
  }

  votar(enqueteId: number, opcaoEscolhida: number): Observable<Enquete> {
    return this.http.post<Enquete>(`${this.apiUrl}${enqueteId}/votar/`, { opcao_escolhida: opcaoEscolhida });
  }

  encerrarEnquete(id: number): Observable<Enquete> {
    return this.http.patch<Enquete>(`${this.apiUrl}${id}/`, { ativa: false });
  }
}
