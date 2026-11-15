import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config';

export interface Aviso {
  id: number;
  titulo: string;
  conteudo: string;
  is_importante: boolean;
  autor_nome: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class AvisosService {
  private apiUrl = `${API_CONFIG.baseUrl}avisos/`;

  constructor(private http: HttpClient) {}

  getAvisos(): Observable<Aviso[]> {
    return this.http.get<Aviso[]>(this.apiUrl);
  }

  criarAviso(dados: { titulo: string; conteudo: string; is_importante: boolean }): Observable<Aviso> {
    return this.http.post<Aviso>(this.apiUrl, dados);
  }

  excluirAviso(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }
}
