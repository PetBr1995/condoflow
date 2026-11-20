import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, MatIconModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'CondoFlow';
  sidebarRecolhida: boolean = false;
  isNativeMobile: boolean = Capacitor.isNativePlatform();

  constructor(private router: Router) {}

  ngOnInit(): void {
    if (this.isNativeMobile) {
      // No app mobile (APK), direciona diretamente para o fluxo de cadastro e scanner facial
      this.router.navigate(['/cadastro']);
    }
  }

  toggleSidebar(): void {
    this.sidebarRecolhida = !this.sidebarRecolhida;
  }

  // Determina se deve exibir o layout privado interno do sistema
  estaLogado(): boolean {
    if (this.isNativeMobile) {
      // No APK mobile nativo, focado 100% no cadastro e scanner facial sem sidebars ou interfaces desktop
      return false;
    }

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
