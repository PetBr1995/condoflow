import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatRipple } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ChartChamadosComponent } from './components/chart-chamados/chart-chamados.component';
import { DashboardService, DashboardData } from './services/dashboard.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatRipple, MatIconModule, ChartChamadosComponent, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  estatisticas: DashboardData | null = null;

  constructor(private dashboardService: DashboardService, public authService: AuthService){}

  ngOnInit(): void {
    this.dashboardService.getEstatisticas().subscribe({
      next: (dados) => {
        this.estatisticas = dados;
      },
      error: (erro) => {
        console.error('Erro ao buscar estatísticas do painel: ', erro);
      }
    });
  }
}
