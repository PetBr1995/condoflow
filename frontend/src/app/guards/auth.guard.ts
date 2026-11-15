import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  // Verifica se o usuário tem token e se ele é válido (não expirado)
  if (authService.isTokenValido) {
    return true;
  } else {
    // Sem token ou token vencido: limpa o armazenamento e redireciona para login
    localStorage.removeItem('token');
    router.navigate(['/login']);
    return false;
  }
};
