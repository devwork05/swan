import type { Metadata } from "next";
import AuthLayout from "@/components/AuthLayout";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Account Login",
  description: "Sign in to your account to continue.",
};

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
