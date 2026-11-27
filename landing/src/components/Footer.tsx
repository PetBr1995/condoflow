"use client";

import Link from "next/link";
import { Building2, ShieldCheck, Heart } from "lucide-react";

export default function Footer() {
  const currentYear = 2026;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:4200";

  return (
    <footer className="bg-surface border-t border-border pt-16 pb-12 text-ink-secondary text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-border">
          {/* Coluna de Marca */}
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center">
                <img src="/favicon.png" alt="CondoFlow" className="w-7 h-7 object-contain" />
              </div>
              <span className="font-display font-semibold text-base text-ink-primary tracking-tight">
                CondoFlow
              </span>
            </div>
            <p className="text-xs text-ink-muted max-w-sm leading-relaxed">
              O sistema operacional predial projetado para eliminar filas, papel e burocracia com biometria facial em tempo real.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-page-subtle text-ink-secondary border border-border">
              <span className="w-1.5 h-1.5 rounded-full bg-status-success"></span>
              <span>Todos os sistemas operacionais • 99.98%</span>
            </div>
          </div>

          {/* Links: Produto */}
          <div className="space-y-2.5">
            <span className="font-semibold text-ink-primary block">Produto</span>
            <ul className="space-y-2">
              <li><a href="#bento" className="hover:text-ink-primary transition-colors">Biometria Facial</a></li>
              <li><a href="#bento" className="hover:text-ink-primary transition-colors">Controle de Encomendas</a></li>
              <li><a href="#bento" className="hover:text-ink-primary transition-colors">Chamados & Manutenção</a></li>
              <li><a href="#bento" className="hover:text-ink-primary transition-colors">Reservas de Áreas</a></li>
              <li><a href="#demonstracao" className="hover:text-ink-primary transition-colors">Simulador de Totem</a></li>
            </ul>
          </div>

          {/* Links: Condomínios */}
          <div className="space-y-2.5">
            <span className="font-semibold text-ink-primary block">Acesso Rápido</span>
            <ul className="space-y-2">
              <li><a href={`${appUrl}/login`} className="hover:text-ink-primary transition-colors">Entrar na Portaria</a></li>
              <li><a href={`${appUrl}/cadastro-morador`} className="hover:text-ink-primary transition-colors">Cadastrar Morador</a></li>
              <li><a href="#precos" className="hover:text-ink-primary transition-colors">Tabela de Preços</a></li>
              <li><a href="#depoimentos" className="hover:text-ink-primary transition-colors">Casos de Sucesso</a></li>
            </ul>
          </div>

          {/* Links: Segurança & Legal */}
          <div className="space-y-2.5">
            <span className="font-semibold text-ink-primary block">Segurança</span>
            <ul className="space-y-2">
              <li className="flex items-center gap-1 text-emerald-600 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% LGPD Compliant</span>
              </li>
              <li><span className="text-ink-muted">Criptografia AES-256</span></li>
              <li><span className="text-ink-muted">Totem Standalone Offline</span></li>
              <li><span className="text-ink-muted">Termos de Uso</span></li>
              <li><span className="text-ink-muted">Política de Privacidade</span></li>
            </ul>
          </div>
        </div>

        {/* Linha Final de Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-ink-muted">
          <div>
            © {currentYear} CondoFlow Technologies Ltda. Todos os direitos reservados.
          </div>
          <div className="flex items-center gap-4">
            <span>Desenvolvido com foco em velocidade e segurança</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
