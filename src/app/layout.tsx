import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { QueryProvider } from "@/lib/QueryProvider";
import { AuthProvider } from "@/lib/AuthContext";
import DynamicBrand from "@/components/DynamicBrand";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Swan Trade Capital | AI-Powered Trading & Investment Platform",
  description:
    "An AI-assisted trading and investment platform—analytics, execution, and support aligned with serious traders and long-term investors.",
  icons: { icon: "/assets/logo.png" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <QueryProvider>
            <AuthProvider>
              <DynamicBrand />
              {children}
            </AuthProvider>
          </QueryProvider>
          <Toaster richColors position="top-center" expand visibleToasts={1} />
        </ThemeProvider>
      </body>
    </html>
  );
}
