import type { Metadata } from "next";
import AuthLayout from "@/components/AuthLayout";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Swan Trade Capital | Forgot Password",
  description: "Request a link to reset your Swan Trade Capital password.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
