import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrlToken = `${API_CONFIG.baseUrl}token/`;

  constructor(private http: HttpClient) { }

  fazerLoginNoDjango(cpf: string, senha: string): Observable<any> {
    const pacote = {
      username: cpf,
      password: senha
    };
    return this.http.post(this.apiUrlToken, pacote);
  }

  get tokenPayload(): any {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payloadBase64 = token.split('.')[1];
      const payloadDecoded = atob(payloadBase64);
      return JSON.parse(payloadDecoded);
    } catch (e) {
      return null;
    }
  }

  get isTokenValido(): boolean {
    const payload = this.tokenPayload;
    if (!payload) return false;
    
    // Se o token tiver timestamp de expiração (exp), valida se não expirou
    if (payload.exp && (payload.exp * 1000) < Date.now()) {
      localStorage.removeItem('token');
      return false;
    }
    return true;
  }

  get isSindico(): boolean {
    return this.tokenPayload?.is_sindico === true;
  }

  get nomeUsuario(): string {
    return this.tokenPayload?.nome || (this.isSindico ? 'Síndico' : 'Morador');
  }

  get condominioNome(): string {
    return this.tokenPayload?.condominio_nome || 'CondoFlow';
  }

  get unidadeMorador(): string {
    return this.tokenPayload?.unidade || '';
  }
}
