import { Capacitor } from '@capacitor/core';

export const API_CONFIG = {
  get baseUrl(): string {
    if (typeof window !== 'undefined') {
      const customUrl = localStorage.getItem('condoflow_api_url');
      if (customUrl) {
        return customUrl.endsWith('/') ? customUrl : `${customUrl}/`;
      }

      // Quando estiver rodando direto como APK no Android
      if (Capacitor.isNativePlatform()) {
        return 'http://192.168.1.2:8000/api/';
      }

      // Desenvolvimento web local
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://127.0.0.1:8000/api/';
      }
    }

    return 'https://condoflow-backend-26n4.onrender.com/api/';
  },

  setCustomUrl(url: string): void {
    if (typeof window !== 'undefined') {
      if (!url || url.trim() === '') {
        localStorage.removeItem('condoflow_api_url');
      } else {
        const urlFormatada = url.trim().endsWith('/') ? url.trim() : `${url.trim()}/`;
        localStorage.setItem('condoflow_api_url', urlFormatada);
      }
    }
  }
};
