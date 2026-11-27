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
                      Visão geral de moradores, controle de manutenções, comunicados oficiais e enquetes.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded text-xs font-mono font-medium bg-surface border border-border text-ink-secondary">
                    Perfil: Síndico / Administrador
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-surface border border-border space-y-1">
                    <span className="text-xs text-ink-muted">Moradores Cadastrados</span>
                    <div className="font-display font-semibold text-xl text-ink-primary">128 Unidades</div>
                    <span className="text-[10px] text-emerald-600 font-medium">Controle por bloco e apto</span>
                  </div>
                  <div className="p-4 rounded-lg bg-surface border border-border space-y-1">
                    <span className="text-xs text-ink-muted">Chamados Ativos</span>
                    <div className="font-display font-semibold text-xl text-ink-primary">3 Chamados</div>
                    <span className="text-[10px] text-amber-600 font-medium">Com fotos e histórico</span>
                  </div>
                  <div className="p-4 rounded-lg bg-surface border border-border space-y-1">
                    <span className="text-xs text-ink-muted">Enquetes & Decisões</span>
                    <div className="font-display font-semibold text-xl text-ink-primary">1 Em votação</div>
                    <span className="text-[10px] text-blue-600 font-medium">Votação digital por unidade</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-surface border border-border flex items-center justify-between text-xs">
                  <span className="font-medium text-ink-primary flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-slate" />
                    Repositório de Atas, Balancetes e Regimento Interno
                  </span>
                  <span className="text-[11px] font-mono text-brand-accent">
                    Módulo de Documentos
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
                      Operação da Portaria & Recepção
                    </h3>
                    <p className="text-xs text-ink-secondary mt-0.5">
                      Identificação facial rápida, consulta de autorizações de visitantes e recebimento de pacotes.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded text-xs font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Módulo de Portaria
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-surface border border-border space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-ink-primary">
                      <Video className="w-4 h-4 text-blue-600" />
                      Validação Facial & Câmera
                    </div>
                    <p className="text-xs text-ink-secondary">
                      Comparação automática do rosto do morador ou visitante cadastrado com o banco biométrico OpenCV para liberação segura do acesso.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-surface border border-border space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-ink-primary">
                      <Key className="w-4 h-4 text-emerald-600" />
                      Registro de Entradas & Encomendas
                    </div>
                    <p className="text-xs text-ink-secondary">
                      Registro de novos pacotes com fotos e código de rastreio, além de log detalhado de todos os visitantes com horário e morador anfitrião.
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
                      Área do Condômino: Tudo no Celular ou Computador
                    </h3>
                    <p className="text-xs text-ink-secondary mt-0.5">
                      Acesso 100% web responsivo sem necessidade de instalação de aplicativos pesados.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded text-xs font-mono font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    Acesso Morador
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 rounded-lg bg-surface border border-border space-y-1.5">
                    <span className="font-semibold text-ink-primary block">Convite com Link Público</span>
                    <p className="text-[11px] text-ink-muted">Gere links para seus convidados enviarem selfie com antecedência via WhatsApp.</p>
                  </div>
                  <div className="p-3.5 rounded-lg bg-surface border border-border space-y-1.5">
                    <span className="font-semibold text-ink-primary block">Avisos de Pacotes</span>
                    <p className="text-[11px] text-ink-muted">Veja a foto da sua encomenda assim que a portaria der entrada no pacote.</p>
                  </div>
                  <div className="p-3.5 rounded-lg bg-surface border border-border space-y-1.5">
                    <span className="font-semibold text-ink-primary block">Reservas & Enquetes</span>
                    <p className="text-[11px] text-ink-muted">Reserve a churrasqueira e participe das assembleias e votações do prédio.</p>
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
