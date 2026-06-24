"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Search, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/chat/Avatar";
import type { Profile } from "@/lib/supabase/database.types";

export function NewChatModal({
  currentProfile,
  onClose,
}: {
  currentProfile: Profile;
  onClose: () => void;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const [starting, setStarting] = useState<string | null>(null);

  async function handleSearch(value: string) {
    setQuery(value);
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .ilike("username", `%${value}%`)
      .neq("id", currentProfile.id)
      .limit(8);
    setResults(data ?? []);
    setSearching(false);
  }

  async function startDirectChat(otherUser: Profile) {
    setStarting(otherUser.id);

    // نتحقق هل عندنا محادثة فردية موجودة مسبقاً مع هذا المستخدم
    const { data: myChats } = await supabase
      .from("chat_participants")
      .select("chat_id")
      .eq("user_id", currentProfile.id);

    const myChatIds = myChats?.map((c) => c.chat_id) ?? [];

    if (myChatIds.length > 0) {
      const { data: shared } = await supabase
        .from("chat_participants")
        .select("chat_id, chats!inner(type)")
        .eq("user_id", otherUser.id)
        .in("chat_id", myChatIds);

      const existingDirect = shared?.find(
        (row: any) => row.chats.type === "direct"
      );

      if (existingDirect) {
        router.push(`/chat/${existingDirect.chat_id}`);
        onClose();
        return;
      }
    }

    // ما فيه محادثة سابقة → ننشئ واحدة جديدة
    const { data: newChat, error: chatError } = await supabase
      .from("chats")
      .insert({ type: "direct", created_by: currentProfile.id })
      .select()
      .single();

    if (chatError || !newChat) {
      setStarting(null);
      return;
    }

    await supabase.from("chat_participants").insert([
      { chat_id: newChat.id, user_id: currentProfile.id },
      { chat_id: newChat.id, user_id: otherUser.id },
    ]);

    router.push(`/chat/${newChat.id}`);
    router.refresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl animate-fade-up">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink">
            محادثة جديدة
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted hover:bg-paper"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-full border border-line px-3.5 py-2.5">
          <Search size={16} className="text-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="ابحث باسم المستخدم"
            className="w-full bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
          />
        </div>

        <div className="mt-3 max-h-72 overflow-y-auto">
          {searching && (
            <div className="flex justify-center py-6">
              <Loader2 size={18} className="animate-spin text-muted" />
            </div>
          )}

          {!searching && query.length >= 2 && results.length === 0 && (
            <p className="py-6 text-center text-sm text-muted">
              ما فيه نتائج لـ "{query}"
            </p>
          )}

          {results.map((user) => (
            <button
              key={user.id}
              onClick={() => startDirectChat(user)}
              disabled={starting !== null}
              className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-right transition-colors hover:bg-paper disabled:opacity-60"
            >
              <Avatar url={user.avatar_url} label={user.username} size={40} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">
                  {user.username}
                </p>
                {user.bio && (
                  <p className="truncate text-xs text-muted">{user.bio}</p>
                )}
              </div>
              {starting === user.id && (
                <Loader2 size={16} className="animate-spin text-moss-500" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
