import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChatWindow } from "@/components/chat/ChatWindow";

export default async function ChatPage({
  params,
}: {
  params: { chatId: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // نتأكد إن المستخدم فعلاً عضو في هذي المحادثة (RLS تحمي هذا أيضاً، لكن نتحقق بوضوح)
  const { data: membership } = await supabase
    .from("chat_participants")
    .select("chat_id")
    .eq("chat_id", params.chatId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) notFound();

  const { data: chat } = await supabase
    .from("chats")
    .select("*, chat_participants(user_id, profiles(*))")
    .eq("id", params.chatId)
    .single();

  if (!chat) notFound();

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_id", params.chatId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .limit(200);

  return (
    <ChatWindow
      chat={chat as any}
      initialMessages={messages ?? []}
      currentUserId={user.id}
    />
  );
}
