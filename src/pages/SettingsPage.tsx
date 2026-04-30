// Settings page. Lets the user update their display name and sign out.
// The email field is read-only — Supabase manages email changes separately.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [saving,      setSaving]      = useState(false);

  useEffect(() => { if (!authLoading && !user) navigate("/auth"); }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("display_name").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => { if (data?.display_name) setDisplayName(data.display_name); });
  }, [user]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ display_name: displayName }).eq("user_id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile saved!");
  }

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  if (authLoading || !user) return null;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-display text-4xl font-semibold">Settings</h1>
      <p className="mt-1 text-muted-foreground">Your account and preferences.</p>

      <Card className="mt-8 p-6 shadow-soft">
        <h2 className="font-display text-xl font-semibold">Profile</h2>
        <form onSubmit={saveProfile} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={user.email ?? ""} disabled />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="displayName">Display name</Label>
            <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="How should we address you?" />
          </div>
          <Button type="submit" variant="warm" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
        </form>
      </Card>

      <Card className="mt-6 p-6 shadow-soft">
        <h2 className="font-display text-xl font-semibold">Account</h2>
        <p className="mt-2 text-sm text-muted-foreground">Signing out will clear your session on this device.</p>
        <Button variant="outline" className="mt-4 text-destructive border-destructive/50 hover:bg-destructive/10" onClick={handleSignOut}>
          Sign out
        </Button>
      </Card>
    </div>
  );
}
