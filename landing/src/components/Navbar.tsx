"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

  const navLinks = [
    { label: "Recursos", href: "#recursos" },
    { label: "Bento Grid", href: "#bento" },
    { label: "Demonstração", href: "#demonstracao" },
    { label: "Depoimentos", href: "#depoimentos" },
    { label: "Planos", href: "#precos" },
  ];

  return (
    <header className="sticky top-0 z-50 py-3.5 px-4 sm:px-6 lg:px-8 bg-white/90 backdrop-blur-md border-b border-border shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo & Marca */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shadow-xs transition-transform duration-200 group-hover:scale-105">
            <img src="/favicon.png" alt="CondoFlow" className="w-8 h-8 object-contain" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-lg text-ink-primary tracking-tight">
              CondoFlow
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-medium text-brand-accent bg-blue-50 border border-blue-200">
              v2.0
            </span>
          </div>
        </Link>

        {/* Navegação Desktop */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-ink-secondary hover:text-ink-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Ações / Botões */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href={`${appUrl}/login`}
            className="text-sm font-semibold text-ink-secondary hover:text-ink-primary px-3 py-2 transition-colors"
          >
            Entrar
          </a>
          <a
            href={`${appUrl}/cadastro-morador`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-brand-accent hover:bg-brand-accent-hover px-4 py-2 rounded-lg shadow-xs transition-all duration-150 active:scale-98"
          >
            <span>Começar Agora</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Botão Mobile Hamburger */}
        <div className="flex md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-ink-secondary hover:text-ink-primary hover:bg-slate-100 transition-colors"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Menu Mobile Retrátil */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-border bg-white px-4 pt-3 pb-6 space-y-3 mt-3 rounded-xl shadow-modal"
          >
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-ink-secondary hover:text-ink-primary py-1.5 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="pt-4 border-t border-border flex flex-col gap-2.5">
              <a
                href={`${appUrl}/login`}
                className="w-full text-center text-sm font-semibold text-ink-primary hover:bg-slate-50 py-2 rounded-lg border border-border bg-white"
              >
                Entrar no Sistema
              </a>
              <a
                href={`${appUrl}/cadastro-morador`}
                className="w-full text-center text-sm font-semibold text-white bg-brand-accent hover:bg-brand-accent-hover py-2.5 rounded-lg shadow-xs"
              >
                Criar Conta / Começar
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
