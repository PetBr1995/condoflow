import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import BentoGrid from "@/components/BentoGrid";
import ProductDeepDive from "@/components/ProductDeepDive";
import SocialProof from "@/components/SocialProof";
import PricingSection from "@/components/PricingSection";
import CtaBanner from "@/components/CtaBanner";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-page">
      {/* Barra de Navegação com Glassmorphism */}
      <Navbar />

      {/* Hero com Simulador Interativo */}
      <HeroSection />

      {/* Bento Grid de Funcionalidades */}
      <BentoGrid />

      {/* Deep-Dive Interativo com Visão Síndico, Portaria e Morador */}
      <ProductDeepDive />

      {/* Prova Social & Depoimentos */}
      <SocialProof />

      {/* Tabela de Preços e Planos */}
      <PricingSection />

      {/* Banner de CTA Final */}
      <CtaBanner />

      {/* Rodapé com Conformidade LGPD */}
      <Footer />
    </main>
  );
}
