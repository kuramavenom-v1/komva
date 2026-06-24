import Link from "next/link";
import { Logo } from "@/components/Logo";
import { AuthForm } from "@/components/AuthForm";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="flex w-full max-w-sm flex-col items-center">
        <Logo size={44} />
        <h1 className="mt-6 font-display text-2xl font-bold text-ink">
          إنشاء حساب جديد
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          ابدأ محادثاتك في أقل من دقيقة
        </p>

        <div className="mt-8 w-full">
          <AuthForm mode="register" />
        </div>

        <p className="mt-6 text-sm text-muted">
          عندك حساب؟{" "}
          <Link
            href="/login"
            className="font-semibold text-moss-500 hover:underline"
          >
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </main>
  );
}
