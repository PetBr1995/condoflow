import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0F172A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "CondoFlow — Sistema Operacional Predial & Biometria Facial por IA",
  description:
    "Elimine filas na portaria e burocracia administrativa com biometria facial em tempo real (<14ms), rastreamento seguro de encomendas e automação de chamados e reservas.",
  keywords: [
    "gestão de condomínios",
    "biometria facial portaria",
    "software para síndicos",
    "portaria remota",
    "controle de encomendas",
    "reservas de áreas comuns",
    "SaaS condominial",
    "CondoFlow"
  ],
  authors: [{ name: "CondoFlow Technologies" }],
  creator: "CondoFlow",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://condoflow.com.br",
    title: "CondoFlow — O Sistema Operacional do seu Condomínio",
    description:
      "Portaria autônoma com biometria facial, controle rigoroso de encomendas e gestão de chamados com transparência em tempo real.",
    siteName: "CondoFlow",
  },
  twitter: {
    card: "summary_large_image",
    title: "CondoFlow — O Sistema Operacional do seu Condomínio",
    description:
      "Biometria facial, rastreamento de encomendas e chamados prediais com a estética e confiabilidade que seu condomínio merece.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: [
      { url: "/favicon.png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${plusJakartaSans.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <body className="bg-page text-ink-primary min-h-screen flex flex-col selection:bg-brand-accent/15 selection:text-brand-slate">
        {children}
      </body>
    </html>
  );
}
