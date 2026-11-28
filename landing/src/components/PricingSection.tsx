"use client";

import { useState } from "react";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { BorderBeam } from "./magicui/border-beam";

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<"mensal" | "anual">("anual");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

  const plans = [
    {
      name: "Essencial",
      desc: "Para condomínios residenciais que desejam digitalizar avisos, encomendas e manutenções.",
      priceMonthly: "R$ 290",
      priceAnnual: "R$ 232",
      badge: null,
      highlight: false,
      features: [
        "Até 50 unidades residenciais",
        "Gestão de Encomendas com fotos e rastreio",
        "Mural de Avisos & Repositório de Documentos",
        "Sistema de Chamados de Manutenção com fotos",
        "Reservas de áreas comuns sem conflito de datas",
        "App Web responsivo para condôminos",
        "Suporte em horário comercial",
      ],
      ctaText: "Começar com Essencial",
      ctaHref: `${appUrl}/cadastro-morador`,
    },
    {
      name: "Pro Facial",
      desc: "O plano completo com biometria facial, controle de acessos de portaria e enquetes digitais.",
      priceMonthly: "R$ 590",
      priceAnnual: "R$ 472",
      badge: "Mais Escolhido",
      highlight: true,
      features: [
        "Até 150 unidades residenciais",
        "Biometria Facial com IA OpenCV",
        "Módulo de Portaria e Validação de Acessos",
        "Auto-cadastro de Visitantes via Link Público",
        "Enquetes e Votações Digitais por Unidade",
        "Gestão de Encomendas com fotos e protocolo",
        "Reservas ilimitadas de áreas comuns",
        "Histórico de Acesso e registros para auditoria",
        "Suporte prioritário",
      ],
      ctaText: "Experimentar Pro por 14 Dias",
      ctaHref: `${appUrl}/cadastro-morador`,
    },
    {
      name: "Enterprise Multi-Torre",
      desc: "Para condomínios de grande porte, administradoras prediais ou operações com vários blocos.",
      priceMonthly: "Sob Consulta",
      priceAnnual: "Sob Consulta",
      badge: "Grandes Operações",
      highlight: false,
      features: [
        "Unidades e blocos residenciais ilimitados",
        "Multi-portarias e pontos de acesso cadastrados",
        "Assembleias virtuais e votações digitais",
        "Repositório completo de atas e regimentos",
        "Gestão de chamados e manutenções prediais",
        "Treinamento dedicado para o síndico e equipe",
        "Contrato personalizado e suporte prioritário",
      ],
      ctaText: "Falar com Especialista",
      ctaHref: `${appUrl}/cadastro-morador`,
    },
  ];

  return (
    <section id="precos" className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="inline-block text-xs font-mono font-medium text-brand-accent tracking-wider uppercase">
            PLANOS TRANSPARENTES
          </span>
          <h2 className="font-display font-semibold text-2xl sm:text-4xl text-ink-primary tracking-tight">
            Investimento previsível para o condomínio. Sem taxas ocultas.
          </h2>
          <p className="text-sm sm:text-base text-ink-secondary">
            Todos os planos incluem 14 dias de teste sem compromisso e cancelamento a qualquer momento.
          </p>

          {/* Toggle de Faturamento */}
          <div className="inline-flex items-center gap-2 p-1 rounded-lg bg-page border border-border mt-4 text-xs font-medium">
            <button
              onClick={() => setBillingCycle("mensal")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                billingCycle === "mensal"
                  ? "bg-surface text-ink-primary shadow-xs font-semibold"
                  : "text-ink-secondary hover:text-ink-primary"
              }`}
            >
              Faturamento Mensal
            </button>
            <button
              onClick={() => setBillingCycle("anual")}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                billingCycle === "anual"
                  ? "bg-surface text-ink-primary shadow-xs font-semibold"
                  : "text-ink-secondary hover:text-ink-primary"
              }`}
            >
              <span>Faturamento Anual</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 font-mono border border-emerald-200">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Grade de Preços */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`rounded-xl border p-6 sm:p-8 flex flex-col justify-between transition-all duration-200 ${
                plan.highlight
                  ? "border-brand-slate bg-surface shadow-modal relative ring-1 ring-brand-slate/10"
                  : "border-border bg-page hover:border-border-strong"
              }`}
            >
              {plan.highlight && (
                <BorderBeam size={240} duration={10} colorFrom="#2563EB" colorTo="#38BDF8" borderWidth={1.5} />
              )}

              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-semibold bg-brand-slate text-white shadow-xs">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    {plan.badge}
                  </span>
                </div>
              )}

              <div>
                <div className="space-y-1">
                  <h3 className="font-display font-semibold text-lg text-ink-primary">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-ink-secondary min-h-[32px] leading-relaxed">
                    {plan.desc}
                  </p>
                </div>

                <div className="my-6 pb-6 border-b border-border">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display font-semibold text-3xl sm:text-4xl text-ink-primary">
                      {billingCycle === "anual" ? plan.priceAnnual : plan.priceMonthly}
                    </span>
                    {plan.priceMonthly !== "Sob Consulta" && (
                      <span className="text-xs text-ink-muted">/mês por condomínio</span>
                    )}
                  </div>
                  {billingCycle === "anual" && plan.priceMonthly !== "Sob Consulta" && (
                    <span className="text-[11px] text-emerald-600 block mt-1 font-medium">
                      Cobrado anualmente com 20% de desconto
                    </span>
                  )}
                </div>

                {/* Lista de Recursos */}
                <div className="space-y-2.5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-ink-muted block font-medium">
                    O QUE ESTÁ INCLUSO:
                  </span>
                  {plan.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2 text-xs text-ink-secondary">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4">
                <a
                  href={plan.ctaHref}
                  className={`w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    plan.highlight
                      ? "bg-brand-slate hover:bg-brand-dark text-white shadow-xs"
                      : "bg-surface hover:bg-page-subtle text-ink-primary border border-border"
                  }`}
                >
                  <span>{plan.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
