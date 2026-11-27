import { Component, AfterViewInit, ViewChild, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { DashboardData } from '../../services/dashboard.service'; // Importando a Interface

Chart.register(...registerables);

@Component({
  selector: 'app-chart-chamados',
  standalone: true,
  imports: [],
  templateUrl: './chart-chamados.component.html',
  styleUrl: './chart-chamados.component.css'
})
export class ChartChamadosComponent implements AfterViewInit, OnChanges {
  // 1. Criamos a "Caixa de Correio" para receber os dados do Dashboard
  @Input() dados: DashboardData | null = null;
  
  @ViewChild('meuGrafico') graficoRef!: ElementRef;
  
  // Guardamos o gráfico aqui para poder apagar o velho antes de desenhar o novo
  grafico: Chart | null = null; 

  ngAfterViewInit(): void {
    this.desenharGrafico();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.grafico) {
      this.grafico.destroy(); // Apaga o gráfico antigo
    }
    this.desenharGrafico(); // Desenha o novo com os números frescos
  }

  desenharGrafico() {
    // 3. Se não tiver dados (ainda está carregando), não desenha nada
    if (!this.graficoRef || !this.dados) return; 

    this.grafico = new Chart(this.graficoRef.nativeElement, {
      type: 'doughnut', 
      data: {
        labels: ['Em andamento', 'Concluídos', 'Abertos'],
        datasets: [{
          // 4. MÁGICA: Trocamos os números fixos pelos dados da nossa caixa!
          data: [
            this.dados.chamados_andamento || 0,
            this.dados.chamados_concluidos || 0,
            this.dados.chamados_abertos || 0
          ], 
          backgroundColor: ['#d97706', '#16a34a', '#e11d48'],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%', 
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
}

