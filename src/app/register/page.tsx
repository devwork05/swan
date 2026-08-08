import type { Metadata } from "next";
import AuthLayout from "@/components/AuthLayout";
import RegisterForm from "@/components/RegisterForm";

export const metadata: Metadata = {
  title: "Create an Account",
  description: "Complete the details below to sign up.",
};

export default function RegisterPage() {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
}
