import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config';

export interface DocumentoCondominio {
  id: number;
  titulo: string;
  categoria: 'regimento' | 'ata' | 'financeiro' | 'comunicado' | 'outros';
  categoria_display: string;
  arquivo: string;
  descricao?: string;
  criado_por_nome: string;
  tamanho_kb: number;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentosService {
  private apiUrl = `${API_CONFIG.baseUrl}documentos/`;

  constructor(private http: HttpClient) {}

  getDocumentos(): Observable<DocumentoCondominio[]> {
    return this.http.get<DocumentoCondominio[]>(this.apiUrl);
  }

  enviarDocumento(formData: FormData): Observable<DocumentoCondominio> {
    return this.http.post<DocumentoCondominio>(this.apiUrl, formData);
  }

  excluirDocumento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }
}
