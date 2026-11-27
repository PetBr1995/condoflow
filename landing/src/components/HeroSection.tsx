"use client";

import { ArrowRight, ShieldCheck, Zap, Lock, ChevronRight } from "lucide-react";
import InteractiveHeroSim from "./InteractiveHeroSim";
import { RetroGrid } from "./magicui/retro-grid";

export default function HeroSection() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:4200";

  return (
    <section className="relative pt-10 pb-20 md:pt-16 md:pb-28 overflow-hidden bg-[#050C1E] text-white">
      {/* Background RetroGrid em perspectiva sutil + Glows ambiente */}
      <RetroGrid className="opacity-25" />
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-bl from-cyan-500/15 via-blue-600/10 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute top-1/3 left-0 w-[450px] h-[450px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Topo do Hero: Apenas Texto Centralizado de Alto Impacto */}
        <div className="max-w-4xl mx-auto text-center space-y-6 mb-14">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-950/40 shadow-xs text-xs font-medium text-slate-300">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            <span className="text-blue-300 font-medium">Nova Geração de Totens Inteligentes</span>
            <span className="text-slate-600">•</span>
            <a href="#bento" className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-0.5">
              Conheça a IA <ChevronRight className="w-3 h-3" />
            </a>
          </div>

          {/* Headline Principal */}
          <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.12]">
            A portaria do seu condomínio sem filas, papel e sem ponto cego.
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Biometria facial autônoma para moradores e visitantes em menos de 14ms.
            Rastreamento seguro de encomendas e gestão de chamados com prestação de contas em tempo real.
          </p>

          {/* Grupo de Botões (Pill Cyan Glow + Dark Secondary) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <a
              href={`${appUrl}/cadastro-morador`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-400/90 text-white font-medium text-sm shadow-[0_0_25px_rgba(34,211,238,0.3)] transition-all duration-150 active:scale-98"
            >
              <span>Começar Avaliação de 14 Dias</span>
              <ArrowRight className="w-4 h-4 text-cyan-300" />
            </a>

            <a
              href="#demonstracao"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#0c1527]/90 hover:bg-[#131f38] border border-slate-700/80 text-slate-300 hover:text-white font-medium text-sm transition-all duration-150"
            >
              <span>Ver Demonstração do Produto</span>
            </a>
          </div>

          {/* Micro-proof Badges de Confiança */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Conforme LGPD & Criptografia Ponta a Ponta</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Reconhecimento Facial em 14ms</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-cyan-400" />
              <span>Funciona mesmo sem internet local</span>
            </span>
          </div>
        </div>

        {/* Simulador Interativo Real (App Frame estilo Linear/Vercel) */}
        <div className="mt-8">
          <InteractiveHeroSim />
        </div>
      </div>
    </section>
  );
}
