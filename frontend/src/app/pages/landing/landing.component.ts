import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements OnInit {
  quantidadeUnidades: number = 60;
  faqAberto: number | null = null;
  usuarioLogado: boolean = false;
  menuMobileAberto: boolean = false;

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.usuarioLogado = !!localStorage.getItem('token');
  }

  get unidades(): number {
    const val = Number(this.quantidadeUnidades);
    if (isNaN(val) || val < 1) return 10;
    return val;
  }

  get valorMensal(): number {
    const qtd = this.unidades;
    if (qtd <= 30) {
      return 89;
    } else if (qtd <= 100) {
      return 179;
    } else {
      return Math.round(qtd * 1.6);
    }
  }

  get planoRecomendado(): string {
    const qtd = this.unidades;
    if (qtd <= 30) {
      return 'Plano Essencial';
    } else if (qtd <= 100) {
      return 'Plano Profissional';
    } else {
      return 'Plano Enterprise';
    }
  }

  get valorPorUnidade(): string {
    const qtd = this.unidades;
    if (!qtd || qtd <= 0) return '0.00';
    return (this.valorMensal / qtd).toFixed(2);
  }

  toggleFaq(index: number) {
    this.faqAberto = this.faqAberto === index ? null : index;
  }

  toggleMenuMobile() {
    this.menuMobileAberto = !this.menuMobileAberto;
  }

  scrollToSection(sectionId: string) {
    this.menuMobileAberto = false;
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
