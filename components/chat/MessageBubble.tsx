import type { Message } from "@/lib/supabase/database.types";

export function MessageBubble({
  message,
  isOwn,
  compact,
}: {
  message: Message;
  isOwn: boolean;
  compact?: boolean;
}) {
  const time = new Date(message.created_at).toLocaleTimeString("ar", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`flex ${isOwn ? "justify-start" : "justify-end"} ${
        compact ? "mt-0.5" : "mt-2.5"
      }`}
    >
      <div
        className={`max-w-[70%] rounded-bubble px-3.5 py-2 text-sm leading-relaxed shadow-sm ${
          isOwn
            ? "rounded-bl-md bg-white text-ink"
            : "rounded-br-md bg-moss-500 text-white"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <div
          className={`mt-1 flex items-center gap-1 text-[10px] ${
            isOwn ? "text-muted" : "text-white/70"
          }`}
        >
          <span>{time}</span>
          {message.edited_at && <span>· معدّلة</span>}
        </div>
      </div>
    </div>
  );
}
