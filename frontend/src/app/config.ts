export const API_CONFIG = {
  // Se estiver em ambiente local de desenvolvimento, conecta em http://127.0.0.1:8000/api/
  // Se for em produção no Render ou web pública, conecta no backend oficial HTTPS
  baseUrl: (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ? 'http://127.0.0.1:8000/api/'
    : 'https://condoflow-backend-26n4.onrender.com/api/'
};
