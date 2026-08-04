"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import UserTopbar from "@/components/dashboard/UserTopbar";
import { ImpersonationBanner } from "@/components/ImpersonationBanner";
import { useAuth } from "@/lib/AuthContext";

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "ADMIN") router.replace("/dashboard");
  }, [user, loading, router]);

  if (loading || !user || user.role !== "ADMIN") return <FullScreenLoader />;

  return (
    <div className="flex min-h-screen bg-page">
      <AdminSidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col lg:ml-[260px]">
        <ImpersonationBanner />
        <UserTopbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="min-w-0 flex-1 p-4 text-secondary lg:p-6">{children}</main>
      </div>
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutInner>{children}</AdminLayoutInner>;
}
