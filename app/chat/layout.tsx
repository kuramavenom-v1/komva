import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChatShell } from "@/components/chat/ChatShell";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  // جلب كل المحادثات اللي المستخدم عضو فيها، مع آخر رسالة في كل واحدة
  const { data: participantRows } = await supabase
    .from("chat_participants")
    .select("chat_id")
    .eq("user_id", user.id);

  const chatIds = participantRows?.map((r) => r.chat_id) ?? [];

  const { data: chats } = chatIds.length
    ? await supabase
        .from("chats")
        .select("*, chat_participants(user_id, profiles(*))")
        .in("id", chatIds)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <ChatShell currentProfile={profile} initialChats={chats ?? []}>
      {children}
    </ChatShell>
  );
}
