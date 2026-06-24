"use client";

import { useEffect, useRef, useState } from "react";
import { Phone, Video, Send, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/chat/Avatar";
import { MessageBubble } from "@/components/chat/MessageBubble";
import type { Message } from "@/lib/supabase/database.types";
import type { ChatWithParticipants } from "@/components/chat/ChatShell";

export function ChatWindow({
  chat,
  initialMessages,
  currentUserId,
}: {
  chat: ChatWithParticipants;
  initialMessages: Message[];
  currentUserId: string;
}) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const otherUser = chat.chat_participants.find(
    (p) => p.user_id !== currentUserId
  )?.profiles;

  const headerLabel =
    chat.type === "group" ? chat.name ?? "مجموعة" : otherUser?.username ?? "مستخدم";

  const headerSubtitle =
    chat.type === "direct"
      ? otherUser?.status === "online"
        ? "متصل الآن"
        : "غير متصل"
      : `${chat.chat_participants.length} أعضاء`;

  // الاشتراك اللحظي في الرسائل الجديدة لهذي المحادثة
  useEffect(() => {
    setMessages(initialMessages);

    const channel = supabase
      .channel(`messages:${chat.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chat.id}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;

    setSending(true);
    setDraft("");

    const { error } = await supabase.from("messages").insert({
      chat_id: chat.id,
      sender_id: currentUserId,
      content,
    });

    setSending(false);
    if (error) {
      // نرجع النص للمربع لو فشل الإرسال
      setDraft(content);
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-paper">
      {/* رأس المحادثة */}
      <header className="flex items-center justify-between border-b border-line bg-white px-5 py-3.5">
        <div className="flex items-center gap-3">
          <Avatar
            url={chat.type === "direct" ? otherUser?.avatar_url : null}
            label={headerLabel}
            size={42}
            online={chat.type === "direct" && otherUser?.status === "online"}
          />
          <div>
            <p className="text-sm font-semibold text-ink">{headerLabel}</p>
            <p className="text-xs text-muted">{headerSubtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            disabled
            title="المكالمات الصوتية قادمة في مرحلة لاحقة"
            className="rounded-full p-2.5 text-muted/40 cursor-not-allowed"
          >
            <Phone size={18} />
          </button>
          <button
            disabled
            title="مكالمات الفيديو قادمة في مرحلة لاحقة"
            className="rounded-full p-2.5 text-muted/40 cursor-not-allowed"
          >
            <Video size={18} />
          </button>
        </div>
      </header>

      {/* الرسائل */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-ink">لا توجد رسائل بعد</p>
            <p className="mt-1 text-xs text-muted">
              ابدأ المحادثة بإرسال أول رسالة
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {messages.map((message, i) => {
              const isOwn = message.sender_id === currentUserId;
              const prevSameSender =
                i > 0 && messages[i - 1].sender_id === message.sender_id;
              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={isOwn}
                  compact={prevSameSender}
                />
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* صندوق الإرسال */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2.5 border-t border-line bg-white px-4 py-3"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="اكتب رسالة..."
          className="flex-1 rounded-full bg-paper px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-moss-100"
        />
        <button
          type="submit"
          disabled={!draft.trim() || sending}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-moss-500 text-white transition-colors hover:bg-moss-600 disabled:opacity-40"
        >
          {sending ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <Send size={17} className="-scale-x-100" />
          )}
        </button>
      </form>
    </div>
  );
}
