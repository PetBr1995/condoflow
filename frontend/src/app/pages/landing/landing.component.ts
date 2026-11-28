import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, FormsModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements OnInit {
  cicloPreco: 'anual' | 'mensal' = 'anual';
  abaVisaoAtiva: 'sindico' | 'portaria' | 'morador' = 'sindico';
  menuMobileAberto: boolean = false;

  ngOnInit(): void {}

  toggleMenuMobile(): void {
    this.menuMobileAberto = !this.menuMobileAberto;
  }

  scrollToSection(id: string): void {
    this.menuMobileAberto = false;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
