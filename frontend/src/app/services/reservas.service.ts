import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config';

export interface AreaComum {
  id: number;
  nome: string;
  descricao?: string;
  capacidade_maxima: number;
  taxa_reserva: string;
  ativa: boolean;
}

export interface Reserva {
  id: number;
  area_comum: number;
  area_nome: string;
  area_taxa: string;
  morador_nome: string;
  morador_unidade: string;
  data_reserva: string;
  periodo: string;
  periodo_display: string;
  status: 'pendente' | 'confirmada' | 'cancelada' | 'rejeitada';
  status_display: string;
  observacoes?: string;
  resposta_sindico?: string;
  created_at: string;
}

export interface ReservaOcupada {
  id: number | string;
  bloqueio_id?: number;
  area_comum_id: number;
  data_reserva: string;
  periodo: string;
  status: 'pendente' | 'confirmada' | 'bloqueado';
  motivo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReservasService {
  private baseUrl = API_CONFIG.baseUrl;

  constructor(private http: HttpClient) {}

  getAreasComuns(): Observable<AreaComum[]> {
    return this.http.get<AreaComum[]>(`${this.baseUrl}areas-comuns/`);
  }

  getReservas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.baseUrl}reservas/`);
  }

  getDisponibilidade(areaComumId: number): Observable<ReservaOcupada[]> {
    return this.http.get<ReservaOcupada[]>(`${this.baseUrl}areas-comuns/${areaComumId}/disponibilidade/`);
  }

  bloquearData(areaComumId: number, dados: { data: string; periodo?: string; motivo?: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}areas-comuns/${areaComumId}/bloquear-data/`, dados);
  }

  desbloquearData(areaComumId: number, dados: { data?: string; periodo?: string; bloqueio_id?: number }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}areas-comuns/${areaComumId}/desbloquear-data/`, dados);
  }

  solicitarReserva(dados: { area_comum: number; data_reserva: string; periodo: string; observacoes?: string }): Observable<Reserva> {
    return this.http.post<Reserva>(`${this.baseUrl}reservas/`, dados);
  }

  aprovarReserva(id: number): Observable<Reserva> {
    return this.http.post<Reserva>(`${this.baseUrl}reservas/${id}/aprovar/`, {});
  }

  rejeitarReserva(id: number, motivo: string): Observable<Reserva> {
    return this.http.post<Reserva>(`${this.baseUrl}reservas/${id}/rejeitar/`, { resposta_sindico: motivo });
  }

  cancelarReserva(id: number): Observable<Reserva> {
    return this.http.post<Reserva>(`${this.baseUrl}reservas/${id}/cancelar/`, {});
  }
}
