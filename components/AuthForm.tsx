"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Mail, Phone, Loader2 } from "lucide-react";

type Mode = "login" | "register";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const supabase = createClient();

  const [method, setMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "register") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      });
      setLoading(false);
      if (error) return setError(translateError(error.message));
      router.push("/chat");
      router.refresh();
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      if (error) return setError(translateError(error.message));
      router.push("/chat");
      router.refresh();
    }
  }

  async function handlePhoneRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({ phone });
    setLoading(false);
    if (error) return setError(translateError(error.message));
    setOtpSent(true);
  }

  async function handlePhoneVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      phone,
      token: otpCode,
      type: "sms",
    });
    setLoading(false);
    if (error) return setError(translateError(error.message));
    router.push("/chat");
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm animate-fade-up">
      {/* مبدّل طريقة الدخول */}
      <div className="mb-6 flex rounded-full border border-line bg-white p-1">
        <button
          type="button"
          onClick={() => {
            setMethod("email");
            setError(null);
          }}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-sm font-medium transition-colors ${
            method === "email"
              ? "bg-moss-500 text-white"
              : "text-muted hover:text-ink"
          }`}
        >
          <Mail size={15} />
          البريد الإلكتروني
        </button>
        <button
          type="button"
          onClick={() => {
            setMethod("phone");
            setError(null);
          }}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-sm font-medium transition-colors ${
            method === "phone"
              ? "bg-moss-500 text-white"
              : "text-muted hover:text-ink"
          }`}
        >
          <Phone size={15} />
          رقم الهاتف
        </button>
      </div>

      {method === "email" ? (
        <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
          {mode === "register" && (
            <Field
              label="اسم المستخدم"
              value={username}
              onChange={setUsername}
              placeholder="مثال: sara_k"
              required
            />
          )}
          <Field
            label="البريد الإلكتروني"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            required
          />
          <Field
            label="كلمة المرور"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            required
            minLength={6}
          />

          {error && <ErrorBanner message={error} />}

          <SubmitButton loading={loading}>
            {mode === "register" ? "إنشاء حساب" : "تسجيل الدخول"}
          </SubmitButton>
        </form>
      ) : !otpSent ? (
        <form onSubmit={handlePhoneRequestOtp} className="flex flex-col gap-4">
          <Field
            label="رقم الهاتف"
            type="tel"
            value={phone}
            onChange={setPhone}
            placeholder="+966500000000"
            required
          />
          <p className="text-xs leading-relaxed text-muted">
            سنرسل لك رمز تحقق عبر رسالة نصية. تأكد من كتابة الرقم مع رمز
            الدولة (مثل +966).
          </p>

          {error && <ErrorBanner message={error} />}

          <SubmitButton loading={loading}>إرسال رمز التحقق</SubmitButton>
        </form>
      ) : (
        <form onSubmit={handlePhoneVerifyOtp} className="flex flex-col gap-4">
          <Field
            label={`رمز التحقق المُرسل إلى ${phone}`}
            type="text"
            value={otpCode}
            onChange={setOtpCode}
            placeholder="------"
            required
          />
          <button
            type="button"
            onClick={() => setOtpSent(false)}
            className="self-start text-xs font-medium text-moss-500 hover:underline"
          >
            تغيير رقم الهاتف
          </button>

          {error && <ErrorBanner message={error} />}

          <SubmitButton loading={loading}>تأكيد والدخول</SubmitButton>
        </form>
      )}
    </div>
  );
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  minLength,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        dir={type === "email" || type === "tel" ? "ltr" : undefined}
        className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink placeholder:text-muted/70 transition-colors focus:border-moss-500 focus:outline-none"
      />
    </label>
  );
}

function SubmitButton({
  children,
  loading,
}: {
  children: React.ReactNode;
  loading: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-moss-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-moss-600 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-clay/30 bg-clay/10 px-3 py-2 text-sm text-clay">
      {message}
    </div>
  );
}

function translateError(message: string): string {
  const map: Record<string, string> = {
    "Invalid login credentials": "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
    "User already registered": "هذا البريد الإلكتروني مسجل مسبقاً.",
    "Password should be at least 6 characters":
      "كلمة المرور يجب أن تكون 6 أحرف على الأقل.",
    "Token has expired or is invalid": "رمز التحقق غير صحيح أو منتهي الصلاحية.",
  };
  return map[message] ?? message;
}
