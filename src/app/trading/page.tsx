import type { Metadata } from "next";
import Header from "@/components/Header";
import InnerPage from "@/components/InnerPage";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { INNER_PAGES } from "@/data/innerPages";

export const metadata: Metadata = {
  title: "Trading",
  description:
    "Trade and invest across forex, indices, metals, energies and crypto—with AI analytics, fast execution, and flexible accounts.",
};

export default function TradingPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-card">
      <Header />
      <InnerPage data={INNER_PAGES.trading} />
      <Footer />
      <ChatWidget />
    </main>
  );
}
