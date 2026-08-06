import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Platforms from "@/components/Platforms";
import Markets from "@/components/Markets";
import Awards from "@/components/Awards";
import Testimonials from "@/components/Testimonials";
import IBSection from "@/components/IBSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-card dark:bg-[#0b0f19]">
      <Header />
      <Hero />
      <Features />
      <Platforms />
      <Markets />
      <Awards />
      <Testimonials />
      <IBSection />
      <CTASection />
      <Footer />
      <ChatWidget />
    </main>
  );
}
