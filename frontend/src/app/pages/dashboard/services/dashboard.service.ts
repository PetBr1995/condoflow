import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../config';

export interface DashboardData {
  condominio_nome?: string;
  is_sindico?: boolean;
  total_condominios?: number;
  total_moradores: number;
  total_unidades?: number;
  chamados_abertos: number;
  chamados_andamento: number;
  chamados_concluidos: number;
  chamados_cancelados?: number;
  total_chamados?: number;
  avisos_recentes?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${API_CONFIG.baseUrl}dashboard/`;

  constructor(private http: HttpClient) { }

  getEstatisticas(): Observable<DashboardData> {
    return this.http.get<DashboardData>(this.apiUrl);
  }
}
