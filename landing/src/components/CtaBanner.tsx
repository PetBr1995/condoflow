"use client";

import { ArrowRight, ShieldCheck, Zap, Sparkles } from "lucide-react";

export default function CtaBanner() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

  return (
    <section className="py-20 bg-page border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-brand-slate text-white p-8 sm:p-14 relative overflow-hidden shadow-modal">
          {/* Luz de fundo sutil */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="max-w-2xl relative z-10 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-mono text-slate-300">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>TESTE GRATUITO DE 14 DIAS</span>
            </div>

            <h2 className="font-display font-semibold text-2xl sm:text-4xl text-white tracking-tight leading-tight">
              Pronto para colocar a portaria do seu condomínio no piloto automático?
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Crie sua conta agora mesmo e teste a biometria facial, as encomendas e os chamados no seu condomínio sem custos de implantação.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
              <a
                href={`${appUrl}/cadastro-morador`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white hover:bg-slate-100 text-brand-slate font-semibold text-sm shadow-xs transition-all active:scale-98"
              >
                <span>Criar Conta & Começar Agora</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href={`${appUrl}/login`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-white border border-slate-700 font-semibold text-sm transition-all"
              >
                <span>Já sou cadastrado</span>
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Sem fidelidade ou carência
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                Ativação em menos de 10 minutos
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
