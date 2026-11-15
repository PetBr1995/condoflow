import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Guarda de rota pública:
 * Se o usuário já estiver autenticado com token válido,
 * impede que ele veja landing page ou login e redireciona
 * direto para o painel correspondente ao seu perfil.
 */
export const redirectIfAuthenticatedGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (authService.isTokenValido) {
    // Síndico ou Morador -> Dashboard correspondente ao perfil
    // O DashboardComponent renderiza dinamicamente o painel do Síndico ou o Portal do Morador
    const rotaDestino = authService.isSindico ? '/dashboard' : '/dashboard';
    router.navigate([rotaDestino]);
    return false;
  }

  // Não autenticado: permite o acesso à página pública
  return true;
};
