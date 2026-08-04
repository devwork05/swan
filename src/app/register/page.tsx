import type { Metadata } from "next";
import AuthLayout from "@/components/AuthLayout";
import RegisterForm from "@/components/RegisterForm";

export const metadata: Metadata = {
  title: "Swan Trade Capital | Create an Account",
  description: "Complete the details below to sign up for Swan Trade Capital.",
};

export default function RegisterPage() {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
}
