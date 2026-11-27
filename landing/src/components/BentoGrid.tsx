"use client";

import {
  ScanFace,
  PackageCheck,
  Wrench,
  CalendarDays,
  Smartphone,
  CheckCircle2,
  QrCode,
} from "lucide-react";
import { MagicCard } from "./magicui/magic-card";

export default function BentoGrid() {
  return (
    <section id="bento" className="py-20 bg-page border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho da Seção */}
        <div className="max-w-2xl mx-auto text-center mb-14 space-y-3">
          <span className="inline-block text-xs font-mono font-medium text-brand-accent tracking-wider uppercase">
            ARQUITETURA OPERACIONAL
          </span>
          <h2 className="font-display font-semibold text-2xl sm:text-4xl text-ink-primary tracking-tight">
            Tudo o que seu condomínio precisa em um único sistema sóbrio e veloz.
          </h2>
          <p className="text-sm sm:text-base text-ink-secondary leading-relaxed">
            Elimine as planilhas soltas, os livros de portaria manuscritos e os grupos caóticos de WhatsApp.
          </p>
        </div>

        {/* Grade Bento 4x4 com MagicCard (Spotlight Interativo) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card A: Biometria Facial por IA (2 Colunas) */}
          <MagicCard className="md:col-span-2 p-6 sm:p-8" gradientColor="rgba(37, 99, 235, 0.08)">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-page-subtle border border-border flex items-center justify-center text-brand-slate group-hover:scale-105 transition-transform">
                <ScanFace className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-xl text-ink-primary">
                Portaria Autônoma com Biometria Facial por IA
              </h3>
              <p className="text-sm text-ink-secondary leading-relaxed max-w-xl">
                O morador se aproxima e o portão abre em menos de 14ms, mesmo usando boné, óculos de grau ou com pouca iluminação. Visitantes recebem um link seguro via WhatsApp e cadastram a selfie com antecedência.
              </p>
            </div>

            {/* Fragmento de UI Real Integrado no Card */}
            <div className="mt-6 pt-6 border-t border-border-subtle grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-lg bg-page border border-border space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-ink-primary flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                    Auto-Cadastro de Convidado
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Sem Aplicativo
                  </span>
                </div>
                <p className="text-[11px] text-ink-muted">
                  O visitante abre o link temporário no navegador, posiciona o rosto e o acesso fica pré-autorizado para a data agendada.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-page border border-border space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-ink-primary flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-brand-slate" />
                    Reserva de Emergência
                  </span>
                  <span className="text-[10px] font-mono text-ink-secondary">
                    QR Dinâmico
                  </span>
                </div>
                <p className="text-[11px] text-ink-muted">
                  Caso o visitante prefira não usar reconhecimento facial, um QR Code criptografado é gerado com validade de 2 horas.
                </p>
              </div>
            </div>
          </MagicCard>

          {/* Card B: Gestão de Encomendas Rastreável (1 Coluna) */}
          <MagicCard className="p-6 sm:p-8" gradientColor="rgba(37, 99, 235, 0.08)">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-page-subtle border border-border flex items-center justify-center text-brand-slate group-hover:scale-105 transition-transform">
                <PackageCheck className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-xl text-ink-primary">
                Zero Extravios de Encomendas
              </h3>
              <p className="text-sm text-ink-secondary leading-relaxed">
                Leitura de etiqueta com a câmera do totem ou celular da portaria. O morador recebe notificação push imediata e retira com QR Code ou assinatura na tela.
              </p>
            </div>

            {/* Fragmento de UI Simulado */}
            <div className="mt-6 pt-4 border-t border-border-subtle space-y-2">
              <div className="p-2.5 rounded-lg bg-page border border-border flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-ink-secondary">Mercado Livre #8491</span>
                <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Na Portaria
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-page border border-border flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-ink-secondary">Amazon Prime #3319</span>
                <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Retirado
                </span>
              </div>
            </div>
          </MagicCard>

          {/* Card C: Chamados com Linha do Tempo e SLA (1 Coluna) */}
          <MagicCard className="p-6 sm:p-8" gradientColor="rgba(37, 99, 235, 0.08)">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-page-subtle border border-border flex items-center justify-center text-brand-slate group-hover:scale-105 transition-transform">
                <Wrench className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-xl text-ink-primary">
                Chamados & SLA Predial
              </h3>
              <p className="text-sm text-ink-secondary leading-relaxed">
                O morador abre o chamado com foto e descrição. O zelador e o síndico acompanham a ordem de serviço com prazos, aprovação de orçamentos e custos.
              </p>
            </div>

            {/* Linha do Tempo Visual */}
            <div className="mt-6 pt-4 border-t border-border-subtle space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="font-medium text-ink-primary">Lâmpada do Hall Bloco A</span>
              </div>
              <div className="text-[11px] text-ink-muted pl-4 border-l border-border space-y-1">
                <div>Aberto em 27/11 às 14:10</div>
                <div className="text-blue-600 font-medium">Técnico designado • SLA 2h</div>
              </div>
            </div>
          </MagicCard>

          {/* Card D: Reservas de Áreas Comuns com Regras (2 Colunas) */}
          <MagicCard className="md:col-span-2 p-6 sm:p-8" gradientColor="rgba(37, 99, 235, 0.08)">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-page-subtle border border-border flex items-center justify-center text-brand-slate group-hover:scale-105 transition-transform">
                <CalendarDays className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-xl text-ink-primary">
                Reservas sem Conflito e com Regras Automáticas
              </h3>
              <p className="text-sm text-ink-secondary leading-relaxed max-w-xl">
                O salão de festas, churrasqueira ou quadra são agendados diretamente pelo app. O sistema bloqueia duplicidades, aplica regras de taxa de limpeza e checa automaticamente inadimplência de condomínio.
              </p>
            </div>

            {/* Simulação de Calendário em Linha */}
            <div className="mt-6 pt-6 border-t border-border-subtle flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded bg-page-subtle border border-border font-medium text-ink-primary">
                  Churrasqueira 01
                </span>
                <span className="text-[11px] text-ink-secondary">
                  Sábado, 29 Nov • 12:00 às 18:00
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Reserva Confirmada • Taxa Quitada
              </span>
            </div>
          </MagicCard>
        </div>
      </div>
    </section>
  );
}
