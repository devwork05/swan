import type { Metadata } from "next";
import Header from "@/components/Header";
import InnerPage from "@/components/InnerPage";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { INNER_PAGES } from "@/data/innerPages";

export const metadata: Metadata = {
  title: "Partnership | Swan Trade Capital",
  description:
    "Introduce audiences to AI-enhanced trading and investing—earn competitive rewards as they engage with the product.",
};

export default function PartnershipPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-card">
      <Header />
      <InnerPage data={INNER_PAGES.partnership} />
      <Footer />
      <ChatWidget />
    </main>
  );
}
