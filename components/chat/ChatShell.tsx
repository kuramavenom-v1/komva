"use client";

import { useState } from "react";
import type { Profile } from "@/lib/supabase/database.types";
import { Sidebar } from "@/components/chat/Sidebar";

export type ChatWithParticipants = {
  id: string;
  type: "direct" | "group";
  name: string | null;
  created_by: string;
  created_at: string;
  chat_participants: { user_id: string; profiles: Profile }[];
};

export function ChatShell({
  currentProfile,
  initialChats,
  children,
}: {
  currentProfile: Profile;
  initialChats: ChatWithParticipants[];
  children: React.ReactNode;
}) {
  const [chats] = useState<ChatWithParticipants[]>(initialChats);

  return (
    <div className="flex h-screen overflow-hidden bg-paper">
      <Sidebar currentProfile={currentProfile} chats={chats} />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
