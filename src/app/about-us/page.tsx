import type { Metadata } from "next";
import Header from "@/components/Header";
import InnerPage from "@/components/InnerPage";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { INNER_PAGES } from "@/data/innerPages";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "We combine transparent market access, intelligent analytics, and human support—so you can trade and invest with a clearer picture of risk and opportunity.",
};

export default function AboutUsPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-card">
      <Header />
      <InnerPage data={INNER_PAGES["about-us"]} />
      <Footer />
      <ChatWidget />
    </main>
  );
}
