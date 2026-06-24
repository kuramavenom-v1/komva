"use client";

import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { LogOut, Search, SquarePen } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";
import { Avatar } from "@/components/chat/Avatar";
import { NewChatModal } from "@/components/chat/NewChatModal";
import type { Profile } from "@/lib/supabase/database.types";
import type { ChatWithParticipants } from "@/components/chat/ChatShell";

export function Sidebar({
  currentProfile,
  chats,
}: {
  currentProfile: Profile;
  chats: ChatWithParticipants[];
}) {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const [search, setSearch] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);

  const activeChatId = params?.chatId as string | undefined;

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const filteredChats = chats.filter((chat) => {
    const otherUser = chat.chat_participants.find(
      (p) => p.user_id !== currentProfile.id
    )?.profiles;
    const label = chat.type === "group" ? chat.name : otherUser?.username;
    return (label ?? "").toLowerCase().includes(search.toLowerCase());
  });

  return (
    <aside className="flex w-[340px] shrink-0 flex-col border-l border-line bg-white">
      {/* الرأس */}
      <div className="flex items-center justify-between px-4 py-4">
        <Logo size={30} />
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowNewChat(true)}
            title="محادثة جديدة"
            className="rounded-full p-2 text-muted transition-colors hover:bg-moss-50 hover:text-moss-600"
          >
            <SquarePen size={19} />
          </button>
          <button
            onClick={handleSignOut}
            title="تسجيل الخروج"
            className="rounded-full p-2 text-muted transition-colors hover:bg-clay/10 hover:text-clay"
          >
            <LogOut size={19} />
          </button>
        </div>
      </div>

      {/* البحث */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 rounded-full bg-paper px-3.5 py-2">
          <Search size={16} className="text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث في المحادثات"
            className="w-full bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
          />
        </div>
      </div>

      {/* قائمة المحادثات */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {filteredChats.length === 0 ? (
          <EmptyState onNewChat={() => setShowNewChat(true)} />
        ) : (
          filteredChats.map((chat) => {
            const otherUser = chat.chat_participants.find(
              (p) => p.user_id !== currentProfile.id
            )?.profiles;
            const label =
              chat.type === "group" ? chat.name ?? "مجموعة" : otherUser?.username ?? "مستخدم";
            const avatarUrl =
              chat.type === "group" ? null : otherUser?.avatar_url ?? null;
            const isOnline = chat.type === "direct" && otherUser?.status === "online";

            return (
              <Link
                key={chat.id}
                href={`/chat/${chat.id}`}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                  activeChatId === chat.id
                    ? "bg-moss-50"
                    : "hover:bg-paper"
                }`}
              >
                <Avatar
                  url={avatarUrl}
                  label={label}
                  online={isOnline}
                  size={46}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    {label}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {chat.type === "group" ? "محادثة جماعية" : "محادثة فردية"}
                  </p>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* بطاقة المستخدم الحالي */}
      <Link
        href="/chat/settings"
        className="flex items-center gap-3 border-t border-line px-4 py-3 transition-colors hover:bg-paper"
      >
        <Avatar
          url={currentProfile.avatar_url}
          label={currentProfile.username}
          size={38}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">
            {currentProfile.username}
          </p>
          <p className="truncate text-xs text-muted">
            {currentProfile.bio || "أضف نبذة تعريفية"}
          </p>
        </div>
      </Link>

      {showNewChat && (
        <NewChatModal
          currentProfile={currentProfile}
          onClose={() => setShowNewChat(false)}
        />
      )}
    </aside>
  );
}

function EmptyState({ onNewChat }: { onNewChat: () => void }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-moss-50">
        <SquarePen size={22} className="text-moss-500" />
      </div>
      <p className="mt-4 text-sm font-semibold text-ink">
        لا توجد محادثات بعد
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        ابدأ محادثتك الأولى بالضغط على الزر أدناه
      </p>
      <button
        onClick={onNewChat}
        className="mt-4 rounded-full bg-moss-500 px-4 py-2 text-xs font-semibold text-white hover:bg-moss-600"
      >
        محادثة جديدة
      </button>
    </div>
  );
}
