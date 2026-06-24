"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/chat/Avatar";
import type { Profile } from "@/lib/supabase/database.types";

export function ProfileSettingsForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const supabase = createClient();
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    await supabase
      .from("profiles")
      .update({ username, bio })
      .eq("id", profile.id);

    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-6">
      <button
        onClick={() => router.push("/chat")}
        className="mb-4 flex items-center gap-1.5 text-sm text-muted hover:text-ink"
      >
        <ArrowRight size={15} />
        رجوع للمحادثات
      </button>

      <div className="flex flex-col items-center">
        <Avatar url={profile.avatar_url} label={username} size={72} />
      </div>

      <form onSubmit={handleSave} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">اسم المستخدم</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink focus:border-moss-500 focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">نبذة تعريفية</span>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="اكتب نبذة قصيرة عنك..."
            className="resize-none rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink placeholder:text-muted/70 focus:border-moss-500 focus:outline-none"
          />
        </label>

        <button
          type="submit"
          disabled={saving}
          className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-moss-500 py-3 text-sm font-semibold text-white hover:bg-moss-600 disabled:opacity-70"
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          {saved ? "تم الحفظ ✓" : "حفظ التغييرات"}
        </button>
      </form>
    </div>
  );
}
