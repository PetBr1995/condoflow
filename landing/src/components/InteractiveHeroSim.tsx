"use client";

import { useState } from "react";
import {
  Camera,
  ScanFace,
  PackageCheck,
  ShieldCheck,
  CheckCircle2,
  Clock,
  UserCheck,
  QrCode,
  Bell,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { BorderBeam } from "./magicui/border-beam";

export default function InteractiveHeroSim() {
  const [activeTab, setActiveTab] = useState<"facial" | "encomendas" | "auditoria">("facial");
  const [scanState, setScanState] = useState<"idle" | "scanning" | "success">("idle");
  const [selectedPerson, setSelectedPerson] = useState<"morador" | "visitante">("morador");
  const [notifications, setNotifications] = useState<Array<{ id: number; text: string; time: string }>>([
    { id: 1, text: "Acesso registrado: Peterson Brito (Apto 101) liberado via totem", time: "Há 2 min" },
  ]);

  const triggerScan = (tipo: "morador" | "visitante") => {
    setSelectedPerson(tipo);
    setScanState("scanning");

    setTimeout(() => {
      setScanState("success");
      setNotifications((prev) => {
        const novaNotif = {
          id: prev.length + 1,
          text:
            tipo === "morador"
              ? "Portão social destravado: Peterson Brito (Bloco A - Apto 101)"
              : "Visitante autorizado: Carlos Silva (Convite com QR Code validado)",
          time: "Agora mesmo",
        };
        return [novaNotif, ...prev.slice(0, 3)];
      });

      setTimeout(() => {
        setScanState("idle");
      }, 3500);
    }, 700);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-xl border border-border bg-surface shadow-modal overflow-hidden">
      <BorderBeam size={300} duration={14} colorFrom="#2563EB" colorTo="#38BDF8" borderWidth={1.5} />
      {/* Barra de Janela / Frame de Aplicação estilo Vercel / Linear */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-page-subtle border-b border-border text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
          </div>
          <span className="text-border-strong mx-1">|</span>
          <span className="font-mono text-[11px] text-ink-secondary font-medium">
            condoflow-totem-01.local
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            LATÊNCIA: 12ms
          </span>
          <span className="hidden sm:inline text-[11px] text-ink-muted font-mono">
            OPENCV 4.10 AI
          </span>
        </div>
      </div>

      {/* Tabs de Controle da Simulação */}
      <div className="flex items-center gap-1 px-4 py-2 bg-surface border-b border-border-subtle overflow-x-auto">
        <button
          onClick={() => setActiveTab("facial")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            activeTab === "facial"
              ? "bg-brand-slate text-white"
              : "text-ink-secondary hover:bg-page-subtle hover:text-ink-primary"
          }`}
        >
          <ScanFace className="w-3.5 h-3.5" />
          <span>Biometria Facial (Ao Vivo)</span>
        </button>

        <button
          onClick={() => setActiveTab("encomendas")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            activeTab === "encomendas"
              ? "bg-brand-slate text-white"
              : "text-ink-secondary hover:bg-page-subtle hover:text-ink-primary"
          }`}
        >
          <PackageCheck className="w-3.5 h-3.5" />
          <span>Scanner de Encomendas</span>
        </button>

        <button
          onClick={() => setActiveTab("auditoria")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            activeTab === "auditoria"
              ? "bg-brand-slate text-white"
              : "text-ink-secondary hover:bg-page-subtle hover:text-ink-primary"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Auditoria & Eventos ({notifications.length})</span>
        </button>
      </div>

      {/* Conteúdo Principal do Simulador */}
      <div className="p-4 sm:p-6 bg-white min-h-[380px] flex flex-col justify-between">
        {activeTab === "facial" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Visualizador do Scanner / Câmera */}
            <div className="md:col-span-7">
              <div className="relative rounded-lg border border-border bg-slate-950 p-4 aspect-4/3 flex flex-col justify-between overflow-hidden shadow-inner">
                {/* Linhas de Mira HUD */}
                <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-slate-500"></div>
                <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-slate-500"></div>
                <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-slate-500"></div>
                <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-slate-500"></div>

                {/* Topo do Display do Totem */}
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 border border-slate-700/60 text-[10px] font-mono text-slate-300">
                    <Camera className="w-3 h-3 text-emerald-400" />
                    <span>FEED 1080P - 60 FPS</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    PORTÃO SOCIAL
                  </span>
                </div>

                {/* Retículo Central de Detecção Facial */}
                <div className="flex flex-col items-center justify-center my-auto z-10">
                  <div
                    className={`relative w-28 h-32 rounded-2xl border-2 transition-all duration-300 flex items-center justify-center ${
                      scanState === "scanning"
                        ? "border-blue-400 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.3)] animate-pulse"
                        : scanState === "success"
                        ? "border-emerald-400 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                        : "border-slate-700/80 bg-slate-900/40"
                    }`}
                  >
                    {scanState === "idle" && (
                      <ScanFace className="w-12 h-12 text-slate-600" />
                    )}

                    {scanState === "scanning" && (
                      <div className="flex flex-col items-center gap-1 text-blue-400">
                        <RefreshCw className="w-7 h-7 animate-spin" />
                        <span className="font-mono text-[9px] uppercase tracking-wider">
                          Analisando...
                        </span>
                      </div>
                    )}

                    {scanState === "success" && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center text-center text-emerald-400 p-2"
                      >
                        <CheckCircle2 className="w-8 h-8 mb-1" />
                        <span className="text-[10px] font-semibold">
                          RECONHECIDO
                        </span>
                        <span className="text-[8px] font-mono text-emerald-300">
                          99.8% Match
                        </span>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Rodapé do Display do Totem */}
                <div className="z-10 flex items-center justify-between text-[11px] font-mono text-slate-400 bg-black/60 px-3 py-1.5 rounded border border-slate-800">
                  <span>Status:</span>
                  <span
                    className={
                      scanState === "success"
                        ? "text-emerald-400 font-semibold"
                        : scanState === "scanning"
                        ? "text-blue-400"
                        : "text-slate-300"
                    }
                  >
                    {scanState === "idle" && "Aguardando aproximação..."}
                    {scanState === "scanning" && "Verificando biometria..."}
                    {scanState === "success" && "PORTÃO LIBERADO (4s)"}
                  </span>
                </div>
              </div>
            </div>

            {/* Painel de Controle e Disparo Interativo */}
            <div className="md:col-span-5 flex flex-col justify-between h-full space-y-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-page-subtle text-ink-secondary border border-border mb-2">
                  <Sparkles className="w-3 h-3 text-brand-accent" />
                  <span>Interação ao Vivo</span>
                </div>
                <h4 className="font-display font-semibold text-base text-ink-primary">
                  Teste a velocidade da IA
                </h4>
                <p className="text-xs text-ink-secondary mt-1 leading-relaxed">
                  Clique abaixo para simular a chegada de um morador ou de um
                  visitante com pré-cadastro via celular.
                </p>
              </div>

              {/* Botões de Ação para o Usuário Clicar */}
              <div className="space-y-2">
                <button
                  disabled={scanState !== "idle"}
                  onClick={() => triggerScan("morador")}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-border bg-page hover:bg-page-subtle hover:border-border-strong text-left transition-all duration-150 disabled:opacity-50"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-brand-slate text-white flex items-center justify-center">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-ink-primary">
                        Morador Cadastrado
                      </span>
                      <span className="block text-[10px] text-ink-muted">
                        Peterson Brito • Apto 101
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-surface border border-border text-ink-secondary">
                    Simular
                  </span>
                </button>

                <button
                  disabled={scanState !== "idle"}
                  onClick={() => triggerScan("visitante")}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-border bg-page hover:bg-page-subtle hover:border-border-strong text-left transition-all duration-150 disabled:opacity-50"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-blue-600 text-white flex items-center justify-center">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-ink-primary">
                        Visitante c/ QR Code
                      </span>
                      <span className="block text-[10px] text-ink-muted">
                        Carlos Silva • Convidado
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-surface border border-border text-ink-secondary">
                    Simular
                  </span>
                </button>
              </div>

              {/* Box de Confirmação em Tempo Real */}
              <div className="p-3 rounded-lg bg-page-subtle border border-border text-xs">
                <div className="flex items-center gap-1.5 text-ink-secondary font-medium mb-1">
                  <Bell className="w-3.5 h-3.5 text-brand-slate" />
                  <span>Notificação Instantânea no Morador</span>
                </div>
                <p className="text-[11px] text-ink-muted leading-tight">
                  Assim que o totem abre o portão, o morador recebe confirmação com foto e horário no app.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "encomendas" && (
          <div className="py-6 px-2 text-center max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 rounded-xl bg-page-subtle border border-border flex items-center justify-center mx-auto text-brand-slate">
              <PackageCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-base text-ink-primary">
                Gestão Rastreável de Encomendas
              </h4>
              <p className="text-xs text-ink-secondary mt-1">
                A portaria lê o código de barras da caixa com o leitor óptico. O sistema associa a unidade, tira uma foto e envia o push automático com aviso de recebimento.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-page border border-border text-left font-mono text-[11px] space-y-1.5 text-ink-secondary">
              <div className="flex justify-between">
                <span>Rastreio:</span>
                <span className="text-ink-primary font-semibold">BR-749201948ML</span>
              </div>
              <div className="flex justify-between">
                <span>Destinatário:</span>
                <span className="text-ink-primary">Apto 204 • Bloco B</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="text-emerald-600 font-semibold">Aguardando Retirada</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "auditoria" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-xs font-semibold text-ink-primary">
                Histórico Recente de Entradas & Saídas
              </span>
              <span className="text-[10px] font-mono text-ink-muted">
                Audit Log Seguro LGPD
              </span>
            </div>

            <div className="space-y-2">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-page text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-ink-primary font-medium">{item.text}</span>
                  </div>
                  <span className="text-[10px] font-mono text-ink-muted shrink-0 ml-3">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rodapé com Dica de Teclado ou Latência */}
      <div className="flex items-center justify-between px-4 py-2 bg-page-subtle border-t border-border text-[11px] text-ink-secondary">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-ink-muted" />
          <span>Tempo médio de resposta do totem: 0.14 segundos</span>
        </span>
        <span className="font-mono text-ink-muted hidden sm:inline">
          Hardware Standalone Plug & Play
        </span>
      </div>
    </div>
  );
}
