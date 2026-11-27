"use client";

import { ArrowRight, ShieldCheck, Zap, Lock, ChevronRight } from "lucide-react";
import InteractiveHeroSim from "./InteractiveHeroSim";

export default function HeroSection() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:4200";

  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
      {/* Background sutil quadriculado / grid sutil estilo Stripe/Vercel */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f015_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f015_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Topo do Hero: Eyebrow Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface shadow-xs text-xs font-medium text-ink-secondary">
            <span className="w-2 h-2 rounded-full bg-brand-accent"></span>
            <span className="font-display font-medium text-ink-primary">
              Nova Geração de Totens Inteligentes
            </span>
            <span className="text-border-strong">•</span>
            <a
              href="#bento"
              className="inline-flex items-center gap-0.5 text-brand-accent hover:underline"
            >
              Conheça a IA
              <ChevronRight className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Headline & Subheadline */}
        <div className="text-center max-w-3xl mx-auto space-y-5 mb-10">
          <h1 className="font-display font-semibold text-3xl sm:text-5xl lg:text-6xl text-ink-primary tracking-tight leading-[1.12]">
            A portaria do seu condomínio sem filas, sem papel e sem ponto cego.
          </h1>

          <p className="text-base sm:text-lg text-ink-secondary leading-relaxed max-w-2xl mx-auto">
            Biometria facial autônoma para moradores e visitantes em menos de 14ms.
            Rastreamento seguro de encomendas e gestão de chamados com prestação
            de contas em tempo real.
          </p>

          {/* Grupo de CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href={`${appUrl}/cadastro-morador`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-brand-slate hover:bg-brand-dark text-white font-semibold text-sm shadow-xs transition-all duration-150 active:scale-98"
            >
              <span>Começar Avaliação de 14 Dias</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href="#demonstracao"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-surface hover:bg-page-subtle text-ink-primary border border-border font-semibold text-sm transition-all duration-150"
            >
              <span>Ver Demonstração do Produto</span>
            </a>
          </div>

          {/* Micro Prova de Confiança abaixo dos CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-ink-secondary">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Conforme LGPD & Criptografia Ponta a Ponta</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Reconhecimento Facial em 14 milissegundos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-blue-600" />
              <span>Funciona mesmo sem internet local</span>
            </div>
          </div>
        </div>

        {/* Simulador Interativo Real (App Frame) */}
        <div className="mt-8">
          <InteractiveHeroSim />
        </div>
      </div>
    </section>
  );
}
