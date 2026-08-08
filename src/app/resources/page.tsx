import type { Metadata } from "next";
import Header from "@/components/Header";
import InnerPage from "@/components/InnerPage";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { INNER_PAGES } from "@/data/innerPages";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Education, macro data, and AI-assisted explainers—so you understand the “why” behind each market move.",
};

export default function ResourcesPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-card">
      <Header />
      <InnerPage data={INNER_PAGES.resources} />
      <Footer />
      <ChatWidget />
    </main>
  );
}
