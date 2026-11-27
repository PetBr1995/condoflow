"use client";

import { Star, ShieldCheck, Quote, Building } from "lucide-react";

export default function SocialProof() {
  const stats = [
    { value: "+45.000", label: "Acessos diários processados", detail: "Com 99.8% de precisão biométrica" },
    { value: "0", label: "Extravios de encomendas", detail: "Em mais de 120 condomínios auditados" },
    { value: "14ms", label: "Tempo de resposta do totem", detail: "O mais rápido do mercado brasileiro" },
    { value: "-78%", label: "Redução de filas no horário de pico", detail: "Medido em entradas de pedestres e veículos" },
  ];

  const testimonials = [
    {
      name: "Rodrigo Medeiros",
      role: "Síndico Profissional",
      condo: "Residencial Jardins das Palmeiras • 180 aptos",
      content:
        "O maior ganho foi acabar com as discussões de portaria e pacotes extraviados. Hoje o morador recebe a foto do pacote no mesmo segundo que a portaria recebe. A aceitação da biometria facial foi quase de 100% no primeiro mês.",
    },
    {
      name: "Camila Guimarães",
      role: "Diretora de Operações",
      condo: "Alliance Gestão Imobiliária • 34 condomínios",
      content:
        "Como administradora de vários condomínios, a padronização do CondoFlow nos economizou dezenas de horas por semana. O suporte a totens locais sem travar a portaria quando a internet oscila é o grande diferencial técnico.",
    },
    {
      name: "Marcos Vinicius",
      role: "Zelador Geral",
      condo: "Condomínio Infinity Tower • 2 torres",
      content:
        "O sistema de chamados facilitou meu dia a dia. Quando uma lâmpada queima ou um elevador para, o chamado vem com foto e eu atualizo o status pelo celular. A assembleia sabe exatamente onde o dinheiro da manutenção foi gasto.",
    },
  ];

  return (
    <section id="depoimentos" className="py-20 bg-page border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Métricas Auditadas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-16 border-b border-border">
          {stats.map((stat, i) => (
            <div key={i} className="space-y-1">
              <div className="font-display font-semibold text-3xl sm:text-4xl text-ink-primary tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-ink-secondary">
                {stat.label}
              </div>
              <div className="text-[11px] text-ink-muted">
                {stat.detail}
              </div>
            </div>
          ))}
        </div>

        {/* Cabeçalho dos Depoimentos */}
        <div className="text-center max-w-2xl mx-auto mt-16 mb-12 space-y-3">
          <span className="inline-block text-xs font-mono font-medium text-brand-accent tracking-wider uppercase">
            RESULTADOS COMPROVADOS
          </span>
          <h2 className="font-display font-semibold text-2xl sm:text-4xl text-ink-primary tracking-tight">
            Aprovado por quem lida com condomínio todos os dias.
          </h2>
          <p className="text-sm sm:text-base text-ink-secondary">
            Relatos de gestores, administradoras e operadores prediais que já modernizaram suas portarias.
          </p>
        </div>

        {/* Grade de Depoimentos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-surface p-6 flex flex-col justify-between hover:border-border-strong hover:shadow-card-hover transition-all duration-200"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, star) => (
                    <Star key={star} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                  "{t.content}"
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-border-subtle flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-slate text-white flex items-center justify-center font-display font-semibold text-xs">
                  {t.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <div className="text-xs font-semibold text-ink-primary">{t.name}</div>
                  <div className="text-[11px] text-brand-accent font-medium">{t.role}</div>
                  <div className="text-[10px] text-ink-muted">{t.condo}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
