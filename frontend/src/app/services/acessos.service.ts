import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config';

export interface MinhaFaceStatus {
  tem_biometria: boolean;
  id?: number;
  foto_base64?: string;
  qualidade_score?: number;
  capturada_em?: string;
  mensagem?: string;
}

export interface Visitante {
  id: number;
  condominio: number;
  morador: number;
  morador_nome: string;
  endereco?: number;
  morador_unidade: string;
  tipo: 'visitante' | 'prestador' | 'delivery';
  tipo_display: string;
  nome: string;
  documento?: string;
  telefone?: string;
  empresa?: string;
  data_inicio: string;
  data_fim: string;
  periodo: 'dia_inteiro' | 'comercial' | 'manha' | 'tarde' | 'noite';
  periodo_display: string;
  status: 'ativo' | 'expirado' | 'bloqueado' | 'concluido';
  status_display: string;
  codigo_acesso: string;
  observacoes?: string;
  tem_biometria: boolean;
  foto_biometria?: string;
  created_at: string;
  updated_at: string;
}

export interface ResultadoIdentificacao {
  autorizado: boolean;
  status?: 'autorizado' | 'negado' | 'fora_horario' | 'expirado';
  tipo?: string;
  nome?: string;
  unidade?: string;
  similaridade?: number;
  mensagem?: string;
  motivo?: string;
  foto_recortada?: string;
}

export interface RegistroAcesso {
  id: number;
  condominio: number;
  tipo_pessoa: 'morador' | 'visitante' | 'prestador' | 'desconhecido';
  tipo_pessoa_display: string;
  nome_identificado: string;
  destino: string;
  status: 'autorizado' | 'negado' | 'fora_horario' | 'expirado' | 'bloqueado';
  status_display: string;
  motivo: string;
  similaridade: number;
  foto_capturada?: string;
  dispositivo_ponto: string;
  created_at: string;
}

export interface ConvitePublico {
  codigo_acesso: string;
  nome: string;
  tipo: string;
  morador_nome: string;
  unidade: string;
  condominio_nome: string;
  data_inicio: string;
  data_fim: string;
  periodo: string;
  status: string;
  tem_biometria: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AcessosService {
  private baseApi = API_CONFIG.baseUrl;

  constructor(private http: HttpClient) {}

  // --- BIOMETRIA DO MORADOR ---
  getMinhaFace(): Observable<MinhaFaceStatus> {
    return this.http.get<MinhaFaceStatus>(`${this.baseApi}biometrias/minha-face/`);
  }

  cadastrarMinhaFace(fotoBase64: string): Observable<any> {
    return this.http.post(`${this.baseApi}biometrias/cadastrar-minha-face/`, {
      foto_base64: fotoBase64
    });
  }

  removerMinhaFace(): Observable<any> {
    return this.http.delete(`${this.baseApi}biometrias/remover-minha-face/`);
  }

  // --- GESTÃO DE VISITANTES E PRESTADORES ---
  getVisitantes(): Observable<Visitante[]> {
    return this.http.get<Visitante[]>(`${this.baseApi}visitantes/`);
  }

  criarVisitante(dados: Partial<Visitante>): Observable<Visitante> {
    return this.http.post<Visitante>(`${this.baseApi}visitantes/`, dados);
  }

  vincularFaceVisitante(visitanteId: number, fotoBase64: string): Observable<any> {
    return this.http.post(`${this.baseApi}visitantes/${visitanteId}/vincular-face/`, {
      foto_base64: fotoBase64
    });
  }

  excluirVisitante(id: number): Observable<any> {
    return this.http.delete(`${this.baseApi}visitantes/${id}/`);
  }

  // --- LINK PÚBLICO DE SELFIE DO VISITANTE (WHATSAPP) ---
  getConvitePublico(token: string): Observable<ConvitePublico> {
    return this.http.get<ConvitePublico>(`${this.baseApi}visitantes/convite-publico/${token}/`);
  }

  salvarSelfieConvite(token: string, fotoBase64: string): Observable<any> {
    return this.http.post(`${this.baseApi}visitantes/salvar-selfie-convite/${token}/`, {
      foto_base64: fotoBase64
    });
  }

  // --- TERMINAL / TOTEM DA PORTARIA (CÂMERA AO VIVO) ---
  identificarFacePortaria(fotoBase64: string, pontoAcesso: string = 'Portão Principal'): Observable<ResultadoIdentificacao> {
    return this.http.post<ResultadoIdentificacao>(`${this.baseApi}portaria/identificar-face/`, {
      foto_base64: fotoBase64,
      dispositivo_ponto: pontoAcesso
    });
  }

  getHistoricoAcessos(): Observable<RegistroAcesso[]> {
    return this.http.get<RegistroAcesso[]>(`${this.baseApi}portaria/historico/`);
  }
}
