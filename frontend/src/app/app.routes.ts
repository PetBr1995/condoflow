import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { Chamados } from './pages/chamados/chamados';
import { Moradores } from './pages/moradores/moradores';
import { CadastroMorador } from './pages/cadastro-morador/cadastro-morador';
import { ReservasComponent } from './pages/reservas/reservas.component';
import { AvisosComponent } from './pages/avisos/avisos.component';
import { EncomendasComponent } from './pages/encomendas/encomendas.component';
import { AcessosComponent } from './pages/acessos/acessos.component';
import { DocumentosComponent } from './pages/documentos/documentos.component';
import { EnquetesComponent } from './pages/enquetes/enquetes.component';
import { ConvitePublicoComponent } from './pages/convite-publico/convite-publico.component';
import { authGuard } from './guards/auth.guard';
import { redirectIfAuthenticatedGuard } from './guards/redirect-authenticated.guard';

export const routes: Routes = [
  // Rotas Públicas (com redirecionamento automático caso já esteja autenticado)
  { 
    path: '', 
    pathMatch: 'full',
    redirectTo: 'login'
  },
  { 
    path: 'landing', 
    redirectTo: 'login'
  },
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [redirectIfAuthenticatedGuard]
  },
  { 
    path: 'cadastro', 
    component: CadastroMorador,
    canActivate: [redirectIfAuthenticatedGuard]
  },
  {
    path: 'convite/:token',
    component: ConvitePublicoComponent
  },
  
  // Rotas Privadas (Protegidas por JWT)
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard] 
  },
  { 
    path: 'chamados', 
    component: Chamados,
    canActivate: [authGuard] 
  },
  { 
    path: 'reservas', 
    component: ReservasComponent,
    canActivate: [authGuard] 
  },
  { 
    path: 'avisos', 
    component: AvisosComponent,
    canActivate: [authGuard] 
  },
  { 
    path: 'encomendas', 
    component: EncomendasComponent,
    canActivate: [authGuard] 
  },
  { 
    path: 'acessos', 
    component: AcessosComponent,
    canActivate: [authGuard] 
  },
  { 
    path: 'documentos', 
    component: DocumentosComponent,
    canActivate: [authGuard] 
  },
  { 
    path: 'enquetes', 
    component: EnquetesComponent,
    canActivate: [authGuard] 
  },
  { 
    path: 'moradores', 
    component: Moradores,
    canActivate: [authGuard] 
  },

  // Fallback
  { path: '**', redirectTo: 'login' }
];
