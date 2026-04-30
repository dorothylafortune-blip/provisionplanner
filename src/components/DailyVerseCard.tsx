// Displays today's Bible verse and lets signed-in users save it.
// Verse data is stored directly in saved_verses (reference, text, etc.)
// rather than as a foreign key to a verses table — this avoids UUID
// mismatches and works without any database seeding.

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getDailyVerse, type Verse } from "@/lib/verses";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Heart, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export function DailyVerseCard({ compact = false }: { compact?: boolean }) {
  const [verse] = useState<Verse>(getDailyVerse);
  const [saved,  setSaved]  = useState(false);
  const navigate = useNavigate();

  // Check if the signed-in user has already saved today's verse
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("saved_verses")
        .select("id")
        .eq("user_id", user.id)
        .eq("verse_reference", verse.reference)
        .maybeSingle();
      if (data) setSaved(true);
    })();
  }, [verse.reference]);

  async function handleSave() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth"); return; }

    // Store the full verse content directly — no FK to a verses table needed
    const { error } = await supabase.from("saved_verses").insert({
      user_id:         user.id,
      verse_reference: verse.reference,
      verse_text:      verse.text,
      verse_translation: verse.translation,
      verse_reflection:  verse.reflection,
    });

    // 23505 = unique constraint violation — already saved, that's fine
    if (!error || error.code === "23505") {
      setSaved(true);
      if (!error) toast.success("Verse saved!");
    } else {
      toast.error(error.message);
    }
  }

  return (
    <Card className="relative overflow-hidden border-accent/40 bg-gradient-cream p-6 shadow-soft md:p-8">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent/30 blur-3xl" />

      <div className="relative">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-primary">
          <Sparkles className="h-3.5 w-3.5" /> Daily verse
        </div>

        <blockquote className="mt-3 font-display text-xl leading-snug md:text-2xl">
          "{verse.text}"
        </blockquote>

        <p className="mt-3 text-sm font-semibold text-primary">
          {verse.reference}{" "}
          <span className="font-normal text-muted-foreground">({verse.translation})</span>
        </p>

        {!compact && (
          <p className="mt-4 border-l-2 border-accent pl-4 text-sm italic text-muted-foreground">
            {verse.reflection}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Button size="sm" variant={saved ? "secondary" : "warm"} onClick={handleSave}>
            <Heart className={`mr-1 h-4 w-4 ${saved ? "fill-current" : ""}`} />
            {saved ? "Saved" : "Save"}
          </Button>
          {compact && (
            <Button size="sm" variant="ghost" asChild>
              <Link to="/verse">Read more <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
