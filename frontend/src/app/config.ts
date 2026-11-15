import { environment } from '../environments/environment';

export const API_CONFIG = {
  // Se estiver em ambiente local de desenvolvimento, conecta em http://127.0.0.1:8000/api/
  // Se for em produção, usa a URL configurada ou rota relativa /api/
  baseUrl: (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ? 'http://127.0.0.1:8000/api/'
    : environment.apiUrl
};
