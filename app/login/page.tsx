import Link from "next/link";
import { Logo } from "@/components/Logo";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="flex w-full max-w-sm flex-col items-center">
        <Logo size={44} />
        <h1 className="mt-6 font-display text-2xl font-bold text-ink">
          أهلاً بعودتك
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          سجّل دخولك للمتابعة إلى محادثاتك
        </p>

        <div className="mt-8 w-full">
          <AuthForm mode="login" />
        </div>

        <p className="mt-6 text-sm text-muted">
          ما عندك حساب؟{" "}
          <Link
            href="/register"
            className="font-semibold text-moss-500 hover:underline"
          >
            إنشاء حساب جديد
          </Link>
        </p>
      </div>
    </main>
  );
}
