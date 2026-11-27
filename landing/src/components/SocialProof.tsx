"use client";

import { Star, ShieldCheck, Quote, Building } from "lucide-react";
import { NumberTicker } from "./magicui/number-ticker";

export default function SocialProof() {
  const stats = [
    { num: 45000, prefix: "+", suffix: "", label: "Acessos processados", detail: "Com biometria facial e QR Code" },
    { num: 0, prefix: "", suffix: "", isStatic: true, label: "Extravios de encomendas", detail: "Todas as entregas com foto e protocolo" },
    { num: 100, prefix: "", suffix: "%", isStatic: true, label: "Plataforma 100% Web", detail: "Acesse pelo celular, tablet ou PC" },
    { num: 85, prefix: "+", suffix: "%", label: "Adesão dos moradores", detail: "Sem atrito de instalação de aplicativos" },
  ];

  const testimonials = [
    {
      name: "Rodrigo Medeiros",
      role: "Síndico Profissional",
      condo: "Residencial Jardins das Palmeiras • 180 aptos",
      content:
        "O maior ganho foi acabar com as discussões de portaria e pacotes extraviados. Hoje a portaria registra a foto do pacote e o morador visualiza imediatamente no sistema. A biometria facial foi adotada com muita tranquilidade pelos condôminos.",
    },
    {
      name: "Camila Guimarães",
      role: "Diretora de Operações",
      condo: "Alliance Gestão Imobiliária • 34 condomínios",
      content:
        "Como administradora de condomínios, o acesso 100% web direto pelo navegador, sem obrigar os moradores a baixar aplicativos pesados na loja, fez a adesão ser instantânea. A assembleia por enquetes digitais aumentou a participação de todos.",
    },
    {
      name: "Marcos Vinicius",
      role: "Zelador Geral",
      condo: "Condomínio Infinity Tower • 2 torres",
      content:
        "O sistema de chamados facilitou meu dia a dia. Quando uma lâmpada queima ou um portão precisa de reparo, o chamado vem com foto e eu atualizo o status pelo celular para o síndico e o morador acompanharem.",
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
                {stat.isStatic ? (
                  <span>0</span>
                ) : (
                  <NumberTicker value={stat.num} prefix={stat.prefix} suffix={stat.suffix} />
                )}
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
