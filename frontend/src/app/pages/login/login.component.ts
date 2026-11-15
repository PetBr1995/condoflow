import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  erroLogin = ''; 
  perfilSelecionado = 'morador';
  carregando: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  selecionarPerfil(perfil: string) {
    this.perfilSelecionado = perfil;
    this.erroLogin = '';
  }

  fazerLogin(cpf: string, senha: string) {
    if (cpf.trim() === '' || senha.trim() === '') {
      this.erroLogin = 'Preencha os campos para realizar o login.';
      return; 
    } 

    this.erroLogin = '';
    this.carregando = true;
    const cpfLimpo = cpf.replace(/\D/g, '');
    
    this.authService.fazerLoginNoDjango(cpfLimpo, senha).subscribe({
      next: (resposta) => {
        this.carregando = false;
        localStorage.setItem('token', resposta.access);
        
        if (resposta.is_sindico) {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/chamados']);
        }
      },
      error: (erro) => {
        this.carregando = false;
        if (erro.status === 401) {
          this.erroLogin = 'CPF ou senha incorretos. Tente novamente.';
        } else {
          this.erroLogin = 'Servidor iniciando (cold start). Aguarde alguns segundos e tente novamente.';
        }
      }
    });
  }
}
