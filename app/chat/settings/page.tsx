import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileSettingsForm } from "@/components/chat/ProfileSettingsForm";

export default async function SettingsPage() {
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

  return (
    <main className="flex flex-1 items-center justify-center bg-paper px-6">
      <ProfileSettingsForm profile={profile} />
    </main>
  );
}
