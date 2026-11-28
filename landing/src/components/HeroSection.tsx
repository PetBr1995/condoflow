"use client";

import { ArrowRight, ShieldCheck, Zap, Smartphone, ChevronRight } from "lucide-react";
import InteractiveHeroSim from "./InteractiveHeroSim";
import { RetroGrid } from "./magicui/retro-grid";

export default function HeroSection() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-gradient-to-b from-white via-page to-page-subtle text-ink-primary border-b border-border">
      {/* Background RetroGrid sutil + Glow ambiente claro */}
      <RetroGrid className="opacity-40" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-100/50 via-teal-50/30 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Topo do Hero: Apenas Texto Centralizado de Alto Impacto (Tema Claro) */}
        <div className="max-w-4xl mx-auto text-center space-y-6 mb-14">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-200 bg-blue-50/90 shadow-xs text-xs font-medium text-slate-700">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="text-blue-900 font-semibold">Portaria Facial & Gestão Condominial</span>
            <span className="text-slate-300">•</span>
            <a href="#bento" className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-0.5">
              Conheça os Recursos <ChevronRight className="w-3 h-3" />
            </a>
          </div>

          {/* Headline Principal */}
          <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-ink-primary tracking-tight leading-[1.12]">
            A portaria e gestão do seu condomínio sem filas, papel e sem ponto cego.
          </h1>

          {/* Subheadline fiel às capacidades reais do app */}
          <p className="text-base sm:text-lg text-ink-secondary leading-relaxed max-w-2xl mx-auto">
            Biometria facial para moradores e visitantes, rastreamento seguro de encomendas,
            reservas de áreas comuns, chamados de manutenção e assembleias com enquetes digitais.
          </p>

          {/* Grupo de Botões (Brand Accent + Secondary Card) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <a
              href={`${appUrl}/cadastro-morador`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white font-semibold text-sm shadow-[0_2px_12px_rgba(37,99,235,0.25)] transition-all duration-150 active:scale-98"
            >
              <span>Começar Avaliação de 14 Dias</span>
              <ArrowRight className="w-4 h-4 text-blue-100" />
            </a>

            <a
              href="#demonstracao"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-border text-ink-primary font-semibold text-sm shadow-xs transition-all duration-150"
            >
              <span>Ver Demonstração do Produto</span>
            </a>
          </div>

          {/* Micro-proof Badges fiéis ao produto real */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-xs text-ink-secondary">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Conforme LGPD & Proteção de Dados</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Reconhecimento Facial Integrado (OpenCV)</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span>100% Web: Acesse no Celular ou Computador</span>
            </span>
          </div>
        </div>

        {/* Simulador Interativo Real (App Frame estilo Linear/Vercel) */}
        <div className="mt-8 shadow-2xl ring-1 ring-slate-900/10 rounded-xl overflow-hidden">
          <InteractiveHeroSim />
        </div>
      </div>
    </section>
  );
}
