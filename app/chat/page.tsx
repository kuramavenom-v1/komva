import { Logo } from "@/components/Logo";

export default function ChatEmptyPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-paper px-6 text-center">
      <Logo size={48} />
      <h2 className="mt-5 font-display text-xl font-bold text-ink">
        مرحباً بك في كومڤا
      </h2>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
        اختر محادثة من القائمة على اليمين، أو ابدأ محادثة جديدة بالضغط على
        أيقونة القلم.
      </p>
    </main>
  );
}
