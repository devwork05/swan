import type { Metadata } from "next";
import AuthLayout from "@/components/AuthLayout";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Swan Trade Capital | Account Login",
  description: "Sign in to your Swan Trade Capital account to continue.",
};

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
