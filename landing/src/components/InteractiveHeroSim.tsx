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
    <div className="relative w-full max-w-4xl mx-auto rounded-xl border border-slate-800 bg-[#070E22] shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden text-white">
      <BorderBeam size={320} duration={12} colorFrom="#22D3EE" colorTo="#3B82F6" borderWidth={1.5} />

      {/* Barra de Janela / Frame de Aplicação estilo Vercel / Linear */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0A1329] border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
          </div>
          <span className="text-slate-600 mx-1">|</span>
          <span className="font-mono text-[11px] text-slate-400 font-medium">
            condoflow-totem-01.local
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-950/70 text-emerald-400 border border-emerald-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            LATÊNCIA: 12ms
          </span>
          <span className="hidden sm:inline text-[11px] text-slate-400 font-mono">
            OPENCV 4.10 AI
          </span>
        </div>
      </div>

      {/* Tabs de Controle da Simulação */}
      <div className="flex items-center gap-1 px-4 py-2 bg-[#070E22] border-b border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab("facial")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            activeTab === "facial"
              ? "bg-[#131F38] text-white border border-slate-700/80 shadow-xs"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <ScanFace className="w-3.5 h-3.5 text-cyan-400" />
          <span>Biometria Facial (Ao Vivo)</span>
        </button>

        <button
          onClick={() => setActiveTab("encomendas")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            activeTab === "encomendas"
              ? "bg-[#131F38] text-white border border-slate-700/80 shadow-xs"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <PackageCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>Scanner de Encomendas</span>
        </button>

        <button
          onClick={() => setActiveTab("auditoria")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            activeTab === "auditoria"
              ? "bg-[#131F38] text-white border border-slate-700/80 shadow-xs"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Auditoria & Eventos ({notifications.length})</span>
        </button>
      </div>

      {/* Conteúdo Principal do Simulador */}
      <div className="p-4 sm:p-6 bg-[#070E22] min-h-[380px] flex flex-col justify-between">
        {activeTab === "facial" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Visualizador do Scanner / Câmera */}
            <div className="md:col-span-7">
              <div className="relative rounded-lg border border-slate-800 bg-[#020617] p-4 aspect-4/3 flex flex-col justify-between overflow-hidden shadow-inner">
                {/* Linhas de Mira HUD */}
                <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-500"></div>
                <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-500"></div>
                <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-500"></div>
                <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-500"></div>

                {/* Topo do Display do Totem */}
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 border border-slate-700/60 text-[10px] font-mono text-slate-300">
                    <Camera className="w-3 h-3 text-cyan-400" />
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
                        ? "border-cyan-400 bg-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,0.3)] animate-pulse"
                        : scanState === "success"
                        ? "border-emerald-400 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                        : "border-slate-800 bg-slate-900/40"
                    }`}
                  >
                    {scanState === "idle" && (
                      <ScanFace className="w-12 h-12 text-slate-600" />
                    )}

                    {scanState === "scanning" && (
                      <div className="flex flex-col items-center gap-1 text-cyan-400">
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
                        ? "text-cyan-400"
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
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-950/60 text-blue-300 border border-blue-500/30 mb-2">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>Interação ao Vivo</span>
                </div>
                <h4 className="font-display font-semibold text-base text-white">
                  Teste a velocidade da IA
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Clique abaixo para simular a chegada de um morador ou de um
                  visitante com pré-cadastro via celular.
                </p>
              </div>

              {/* Botões de Ação para o Usuário Clicar */}
              <div className="space-y-2">
                <button
                  disabled={scanState !== "idle"}
                  onClick={() => triggerScan("morador")}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-[#0C162C] hover:bg-[#132244] hover:border-slate-700 text-left transition-all duration-150 disabled:opacity-50"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-blue-600 text-white flex items-center justify-center">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-white">
                        Morador Cadastrado
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        Peterson Brito • Apto 101
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                    Simular
                  </span>
                </button>

                <button
                  disabled={scanState !== "idle"}
                  onClick={() => triggerScan("visitante")}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-[#0C162C] hover:bg-[#132244] hover:border-slate-700 text-left transition-all duration-150 disabled:opacity-50"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-cyan-600 text-white flex items-center justify-center">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-white">
                        Visitante c/ QR Code
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        Carlos Silva • Convidado
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                    Simular
                  </span>
                </button>
              </div>

              {/* Box de Confirmação em Tempo Real */}
              <div className="p-3 rounded-lg bg-[#0A1329] border border-slate-800 text-xs">
                <div className="flex items-center gap-1.5 text-slate-300 font-medium mb-1">
                  <Bell className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Notificação Instantânea no Morador</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Assim que o totem abre o portão, o morador recebe confirmação com foto e horário no app.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "encomendas" && (
          <div className="py-6 px-2 text-center max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-cyan-400">
              <PackageCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-base text-white">
                Gestão Rastreável de Encomendas
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                A portaria lê o código de barras da caixa com o leitor óptico. O sistema associa a unidade, tira uma foto e envia o push automático com aviso de recebimento.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[#0C162C] border border-slate-800 text-left font-mono text-[11px] space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span>Rastreio:</span>
                <span className="text-white font-semibold">BR-749201948ML</span>
              </div>
              <div className="flex justify-between">
                <span>Destinatário:</span>
                <span className="text-slate-300">Apto 204 • Bloco B</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="text-emerald-400 font-semibold">Aguardando Retirada</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "auditoria" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-semibold text-white">
                Histórico Recente de Entradas & Saídas
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Audit Log Seguro LGPD
              </span>
            </div>

            <div className="space-y-2">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-800 bg-[#0C162C] text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                    <span className="text-white font-medium">{item.text}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-3">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rodapé com Dica de Teclado ou Latência */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0A1329] border-t border-slate-800 text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Tempo médio de resposta do totem: 0.14 segundos</span>
        </span>
        <span className="font-mono text-slate-500 hidden sm:inline">
          Hardware Standalone Plug & Play
        </span>
      </div>
    </div>
  );
}
