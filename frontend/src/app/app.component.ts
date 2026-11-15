import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, MatIconModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'CondoFlow';
  sidebarRecolhida: boolean = false;

  constructor(private router: Router) {}

  toggleSidebar(): void {
    this.sidebarRecolhida = !this.sidebarRecolhida;
  }

  // Determina se deve exibir o layout privado interno do sistema
  estaLogado(): boolean {
    if (!localStorage.getItem('token')) {
      return false;
    }

    const rotaAtual = this.router.url.split('?')[0].split('#')[0];
    const rotasPublicas = ['', '/', '/landing', '/login', '/cadastro'];

    if (rotasPublicas.includes(rotaAtual)) {
      return false;
    }

    return true;
  }
}
