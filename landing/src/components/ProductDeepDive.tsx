"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  ShieldAlert,
  Smartphone,
  CheckCircle,
  FileText,
  Users,
  Video,
  Key,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function ProductDeepDive() {
  const [role, setRole] = useState<"sindico" | "portaria" | "morador">("sindico");

  return (
    <section id="demonstracao" className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="inline-block text-xs font-mono font-medium text-brand-accent tracking-wider uppercase">
            EXPERIÊNCIA INTEGRADA
          </span>
          <h2 className="font-display font-semibold text-2xl sm:text-4xl text-ink-primary tracking-tight">
            Uma plataforma unificada para quem administra, opera e reside.
          </h2>
          <p className="text-sm sm:text-base text-ink-secondary">
            Alterne entre as perspectivas abaixo para ver como o CondoFlow se adapta a cada elo da operação predial.
          </p>

          {/* Seletor de Papéis */}
          <div className="inline-flex p-1 rounded-lg bg-page-subtle border border-border mt-4">
            <button
              onClick={() => setRole("sindico")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-all ${
                role === "sindico"
                  ? "bg-surface text-ink-primary shadow-xs"
                  : "text-ink-secondary hover:text-ink-primary"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Síndico & Gestor</span>
            </button>
            <button
              onClick={() => setRole("portaria")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-all ${
                role === "portaria"
                  ? "bg-surface text-ink-primary shadow-xs"
                  : "text-ink-secondary hover:text-ink-primary"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Portaria & Segurança</span>
            </button>
            <button
              onClick={() => setRole("morador")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-all ${
                role === "morador"
                  ? "bg-surface text-ink-primary shadow-xs"
                  : "text-ink-secondary hover:text-ink-primary"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Morador no Celular</span>
            </button>
          </div>
        </div>

        {/* Display do Papel Selecionado */}
        <div className="max-w-4xl mx-auto rounded-xl border border-border bg-page p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {role === "sindico" && (
              <motion.div
                key="sindico"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
                  <div>
                    <h3 className="font-display font-semibold text-lg text-ink-primary">
                      Painel Executivo de Gestão & Auditoria
                    </h3>
                    <p className="text-xs text-ink-secondary mt-0.5">
                      Controle de custos de manutenção, relatórios de acesso e assembleias digitais.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded text-xs font-mono font-medium bg-surface border border-border text-ink-secondary">
                    Perfil: Administrador Global
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-surface border border-border space-y-1">
                    <span className="text-xs text-ink-muted">Acessos Monitorados Hoje</span>
                    <div className="font-display font-semibold text-xl text-ink-primary">1.284</div>
                    <span className="text-[10px] text-emerald-600 font-medium">99.8% via Biometria</span>
                  </div>
                  <div className="p-4 rounded-lg bg-surface border border-border space-y-1">
                    <span className="text-xs text-ink-muted">Chamados em Aberto</span>
                    <div className="font-display font-semibold text-xl text-ink-primary">3</div>
                    <span className="text-[10px] text-amber-600 font-medium">Todos dentro do SLA</span>
                  </div>
                  <div className="p-4 rounded-lg bg-surface border border-border space-y-1">
                    <span className="text-xs text-ink-muted">Economia Operacional Est.</span>
                    <div className="font-display font-semibold text-xl text-ink-primary">R$ 4.200/mês</div>
                    <span className="text-[10px] text-blue-600 font-medium">Redução de papel e horas extras</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-surface border border-border flex items-center justify-between text-xs">
                  <span className="font-medium text-ink-primary flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-slate" />
                    Exportar Prestação de Contas Mensal (PDF Auditável)
                  </span>
                  <span className="text-[11px] font-mono text-brand-accent hover:underline cursor-pointer">
                    Baixar Relatório Modelo
                  </span>
                </div>
              </motion.div>
            )}

            {role === "portaria" && (
              <motion.div
                key="portaria"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
                  <div>
                    <h3 className="font-display font-semibold text-lg text-ink-primary">
                      Central da Portaria & Monitoramento em Tempo Real
                    </h3>
                    <p className="text-xs text-ink-secondary mt-0.5">
                      Visualização de filas, liberação remota de emergência e cadastro de entregadores.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded text-xs font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Totens Online: 4 de 4
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-surface border border-border space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-ink-primary">
                      <Video className="w-4 h-4 text-blue-600" />
                      Scanner de Totem com IA
                    </div>
                    <p className="text-xs text-ink-secondary">
                      Caso alguém não consiga entrar pelo totem, o operador na portaria ou central recebe um alerta sonoro com o vídeo do portão em tela cheia.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-surface border border-border space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-ink-primary">
                      <Key className="w-4 h-4 text-emerald-600" />
                      Desbloqueio com Registro de Auditoria
                    </div>
                    <p className="text-xs text-ink-secondary">
                      Toda abertura forçada exige motivo gravado em log inalterável com foto do solicitante para garantir a segurança jurídica do condomínio.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {role === "morador" && (
              <motion.div
                key="morador"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
                  <div>
                    <h3 className="font-display font-semibold text-lg text-ink-primary">
                      App do Condômino: Controle Total na Palma da Mão
                    </h3>
                    <p className="text-xs text-ink-secondary mt-0.5">
                      Disponível em PWA e Web sem necessidade de downloads pesados.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded text-xs font-mono font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    Acesso Morador
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 rounded-lg bg-surface border border-border space-y-1.5">
                    <span className="font-semibold text-ink-primary block">Convites Instantâneos</span>
                    <p className="text-[11px] text-ink-muted">Envie links para churrascos ou prestadores via WhatsApp em 2 cliques.</p>
                  </div>
                  <div className="p-3.5 rounded-lg bg-surface border border-border space-y-1.5">
                    <span className="font-semibold text-ink-primary block">Avisos de Pacotes</span>
                    <p className="text-[11px] text-ink-muted">Foto da encomenda assim que o carteiro deixa na recepção.</p>
                  </div>
                  <div className="p-3.5 rounded-lg bg-surface border border-border space-y-1.5">
                    <span className="font-semibold text-ink-primary block">Mural & Enquetes</span>
                    <p className="text-[11px] text-ink-muted">Vote em decisões de melhoria predial sem precisar ir a reuniões longas.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
