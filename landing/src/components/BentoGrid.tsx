"use client";

import {
  ScanFace,
  PackageCheck,
  Wrench,
  CalendarDays,
  Smartphone,
  CheckCircle2,
  QrCode,
  Vote,
  FileText,
  BellRing,
} from "lucide-react";
import { MagicCard } from "./magicui/magic-card";

export default function BentoGrid() {
  return (
    <section id="bento" className="py-20 bg-page border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho da Seção */}
        <div className="max-w-2xl mx-auto text-center mb-14 space-y-3">
          <span className="inline-block text-xs font-mono font-medium text-brand-accent tracking-wider uppercase">
            MÓDULOS REAIS INTEGRADOS
          </span>
          <h2 className="font-display font-semibold text-2xl sm:text-4xl text-ink-primary tracking-tight">
            Tudo o que seu condomínio precisa em um único sistema web sóbrio e veloz.
          </h2>
          <p className="text-sm sm:text-base text-ink-secondary leading-relaxed">
            Elimine as planilhas soltas, os cadernos de papel na portaria e o ruído em grupos de mensagens.
          </p>
        </div>

        {/* Grade Bento com MagicCard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Biometria Facial & Convite Público (2 Colunas) */}
          <MagicCard className="md:col-span-2 p-6 sm:p-8" gradientColor="rgba(37, 99, 235, 0.08)">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-page-subtle border border-border flex items-center justify-center text-brand-slate group-hover:scale-105 transition-transform">
                <ScanFace className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-display font-semibold text-xl text-ink-primary">
                Biometria Facial & Auto-Cadastro de Visitantes
              </h3>
              <p className="text-sm text-ink-secondary leading-relaxed max-w-xl">
                Cadastro facial direto pelo navegador via selfie com vetor de 128 dimensões processado no backend. Moradores geram links públicos para visitantes cadastrarem o rosto com antecedência.
              </p>
            </div>

            {/* Fragmento de UI Real Integrado */}
            <div className="mt-6 pt-6 border-t border-border-subtle grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-lg bg-page border border-border space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-ink-primary flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                    Convite Público via Link
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Direto no Navegador
                  </span>
                </div>
                <p className="text-[11px] text-ink-muted">
                  O visitante abre o link pelo WhatsApp, anexa a selfie e a portaria recebe o cadastro pronto para validação.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-page border border-border space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-ink-primary flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-brand-slate" />
                    Autorização com QR Code
                  </span>
                  <span className="text-[10px] font-mono text-ink-secondary">
                    Data Programada
                  </span>
                </div>
                <p className="text-[11px] text-ink-muted">
                  Acesso liberado exclusivamente no dia e horário autorizados pelo morador anfitrião.
                </p>
              </div>
            </div>
          </MagicCard>

          {/* Card 2: Gestão de Encomendas (1 Coluna) */}
          <MagicCard className="p-6 sm:p-8" gradientColor="rgba(37, 99, 235, 0.08)">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-page-subtle border border-border flex items-center justify-center text-brand-slate group-hover:scale-105 transition-transform">
                <PackageCheck className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="font-display font-semibold text-xl text-ink-primary">
                Controle de Encomendas
              </h3>
              <p className="text-sm text-ink-secondary leading-relaxed">
                A portaria registra o pacote com foto, código de rastreio e unidade. O morador é notificado no painel e a entrega é protocolada com data e hora.
              </p>
            </div>

            {/* Fragmento de UI */}
            <div className="mt-6 pt-4 border-t border-border-subtle space-y-2">
              <div className="p-2.5 rounded-lg bg-page border border-border flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-ink-secondary">Mercado Livre #8491</span>
                <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Aguardando Retirada
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-page border border-border flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-ink-secondary">Amazon Prime #3319</span>
                <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Entregue ao Morador
                </span>
              </div>
            </div>
          </MagicCard>

          {/* Card 3: Chamados de Manutenção com Fotos (1 Coluna) */}
          <MagicCard className="p-6 sm:p-8" gradientColor="rgba(37, 99, 235, 0.08)">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-page-subtle border border-border flex items-center justify-center text-brand-slate group-hover:scale-105 transition-transform">
                <Wrench className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="font-display font-semibold text-xl text-ink-primary">
                Chamados & Manutenções
              </h3>
              <p className="text-sm text-ink-secondary leading-relaxed">
                Moradores abrem ocorrências com fotos e descrição. Síndico e zelador acompanham em tempo real com status: Aberto, Em Andamento e Concluído.
              </p>
            </div>

            {/* Linha do Tempo Visual */}
            <div className="mt-6 pt-4 border-t border-border-subtle space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="font-medium text-ink-primary">Lâmpada queimada Bloco A</span>
              </div>
              <div className="text-[11px] text-ink-muted pl-4 border-l border-border space-y-1">
                <div>Registrado com foto anexa</div>
                <div className="text-blue-600 font-medium">Status: Em Andamento</div>
              </div>
            </div>
          </MagicCard>

          {/* Card 4: Enquetes e Votações Digitais (1 Coluna) - NOVO E 100% REAL */}
          <MagicCard className="p-6 sm:p-8" gradientColor="rgba(37, 99, 235, 0.08)">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-page-subtle border border-border flex items-center justify-center text-brand-slate group-hover:scale-105 transition-transform">
                <Vote className="w-5 h-5 text-teal-600" />
              </div>
              <h3 className="font-display font-semibold text-xl text-ink-primary">
                Enquetes & Decisões Digitais
              </h3>
              <p className="text-sm text-ink-secondary leading-relaxed">
                Consulte a opinião dos moradores de forma transparente. Votação segura com voto por unidade e apuração de resultados em tempo real.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-border-subtle space-y-2">
              <div className="p-2.5 rounded-lg bg-page border border-border space-y-1.5 text-xs">
                <div className="font-medium text-ink-primary">Instalação de Carregador Elétrico</div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-teal-500 h-full w-[76%]"></div>
                </div>
                <div className="flex justify-between text-[10px] text-ink-muted">
                  <span>76% A favor</span>
                  <span>42 votos apurados</span>
                </div>
              </div>
            </div>
          </MagicCard>

          {/* Card 5: Mural de Avisos & Documentos Oficiais (1 Coluna) - NOVO E 100% REAL */}
          <MagicCard className="p-6 sm:p-8" gradientColor="rgba(37, 99, 235, 0.08)">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-page-subtle border border-border flex items-center justify-center text-brand-slate group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-display font-semibold text-xl text-ink-primary">
                Mural de Avisos & Documentos
              </h3>
              <p className="text-sm text-ink-secondary leading-relaxed">
                Central de comunicados oficiais com prazo de expiração, além de repositório seguro para atas de reunião, regimento interno e regulamentos.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-border-subtle space-y-2">
              <div className="p-2.5 rounded-lg bg-page border border-border flex items-center justify-between text-xs">
                <span className="font-medium text-ink-primary flex items-center gap-1.5">
                  <BellRing className="w-3.5 h-3.5 text-amber-500" />
                  Manutenção da Caixa d'Água
                </span>
                <span className="text-[10px] font-mono text-ink-muted">Até 30/11</span>
              </div>
              <div className="p-2.5 rounded-lg bg-page border border-border flex items-center justify-between text-xs">
                <span className="font-medium text-ink-primary flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  Ata Assembleia Geral 2026.pdf
                </span>
                <span className="text-[10px] font-mono text-brand-accent">PDF</span>
              </div>
            </div>
          </MagicCard>

          {/* Card 6: Reservas de Áreas Comuns (3 Colunas / Full Width no Grid) */}
          <MagicCard className="md:col-span-3 p-6 sm:p-8" gradientColor="rgba(37, 99, 235, 0.08)">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="w-10 h-10 rounded-lg bg-page-subtle border border-border flex items-center justify-center text-brand-slate">
                  <CalendarDays className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-display font-semibold text-xl text-ink-primary">
                  Reservas de Áreas Comuns com Prevenção de Conflitos
                </h3>
                <p className="text-sm text-ink-secondary leading-relaxed">
                  Agendamento simples de salão de festas, churrasqueiras e quadras. O sistema valida automaticamente a disponibilidade e bloqueia choques de datas entre moradores. O síndico pode bloquear datas para limpeza ou manutenção.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-page border border-border space-y-3 min-w-[280px]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-ink-primary">Churrasqueira 01</span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Disponível
                  </span>
                </div>
                <div className="text-xs text-ink-secondary">
                  Sábado, 29 Nov • 12:00 às 18:00
                </div>
                <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Sem conflito de agenda detectado
                </div>
              </div>
            </div>
          </MagicCard>
        </div>
      </div>
    </section>
  );
}
