import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'CondoFlow';

  constructor(private router: Router) {}

  // Determina se deve exibir o menu privado superior do sistema
  estaLogado(): boolean {
    // 1. Se não tiver token armazenado, não está logado
    if (!localStorage.getItem('token')) {
      return false;
    }

    // 2. Rotas públicas NUNCA devem exibir o menu privado interno do sistema
    const rotaAtual = this.router.url.split('?')[0].split('#')[0];
    const rotasPublicas = ['', '/', '/landing', '/login', '/cadastro'];

    if (rotasPublicas.includes(rotaAtual)) {
      return false;
    }

    return true;
  }
}
