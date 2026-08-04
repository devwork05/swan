"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import UserSidebar from "@/components/dashboard/UserSidebar";
import UserTopbar from "@/components/dashboard/UserTopbar";
import ChatWidget from "@/components/ChatWidget";
import { ImpersonationBanner } from "@/components/ImpersonationBanner";
import { useAuth } from "@/lib/AuthContext";

function UserLayoutInner({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    // Admins visiting user routes bounce to the admin dashboard so they don't
    // trip over user-only endpoints.
    if (user.role === "ADMIN") router.replace("/admin/dashboard");
  }, [user, loading, router]);

  if (loading || !user || user.role === "ADMIN") return <FullScreenLoader />;

  return (
    <div className="flex min-h-screen bg-page">
      <UserSidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col lg:ml-[280px]">
        <ImpersonationBanner />
        <UserTopbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="min-w-0 flex-1 p-4 text-secondary lg:p-6">{children}</main>
      </div>

      <ChatWidget />
    </div>
  );
}

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-page text-muted">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  );
}

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return <UserLayoutInner>{children}</UserLayoutInner>;
}
