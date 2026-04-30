// Daily verse page. Shows the full verse card with reflection, plus all
// verses the user has saved. Saved verse content is stored as plain columns
// (no join to a verses table required).

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DailyVerseCard } from "@/components/DailyVerseCard";
import { Heart, Trash2, BookHeart } from "lucide-react";
import { toast } from "sonner";

interface SavedVerse {
  id:                string;
  created_at:        string;
  verse_reference:   string;
  verse_text:        string;
  verse_translation: string;
  verse_reflection:  string;
}

export default function VersePage() {
  const { user } = useAuth();
  const [saved,   setSaved]   = useState<SavedVerse[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadSaved() {
    if (!user) { setSaved([]); setLoading(false); return; }
    const { data, error } = await supabase
      .from("saved_verses")
      .select("id, created_at, verse_reference, verse_text, verse_translation, verse_reflection")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setSaved(data ?? []);
    setLoading(false);
  }

  useEffect(() => { loadSaved(); }, [user]);

  async function removeSaved(id: string) {
    const { error } = await supabase.from("saved_verses").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setSaved((s) => s.filter((x) => x.id !== id));
    toast.success("Removed.");
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl font-semibold">Daily verse</h1>
        <p className="mt-2 text-muted-foreground">A new verse every day to bring a moment of calm to your week.</p>
      </div>

      {/* Full verse with reflection text */}
      <div className="mt-8 max-w-3xl">
        <DailyVerseCard compact={false} />
      </div>

      {/* Saved verses */}
      <div className="mt-14 max-w-3xl">
        <div className="mb-4 flex items-center gap-2">
          <BookHeart className="h-5 w-5 text-primary" />
          <h2 className="font-display text-2xl font-semibold">Your saved verses</h2>
        </div>

        {!user ? (
          <Card className="border-dashed bg-card/60 p-8 text-center">
            <p className="text-muted-foreground">
              <Link to="/auth" className="font-medium text-primary hover:underline">Sign in</Link>{" "}
              to save verses to come back to.
            </p>
          </Card>
        ) : loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : saved.length === 0 ? (
          <Card className="border-dashed bg-card/60 p-8 text-center">
            <Heart className="mx-auto h-8 w-8 text-primary/70" />
            <p className="mt-3 text-muted-foreground">Tap the Save button on today's verse to keep it here.</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {saved.map((s) => (
              <Card key={s.id} className="p-5 shadow-soft">
                <blockquote className="font-display text-lg leading-snug">"{s.verse_text}"</blockquote>
                <div className="mt-2 flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-primary">
                    {s.verse_reference}{" "}
                    <span className="font-normal text-muted-foreground">({s.verse_translation})</span>
                  </p>
                  <Button variant="ghost" size="icon" onClick={() => removeSaved(s.id)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
                {s.verse_reflection && (
                  <p className="mt-3 border-l-2 border-accent pl-4 text-sm italic text-muted-foreground">
                    {s.verse_reflection}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
