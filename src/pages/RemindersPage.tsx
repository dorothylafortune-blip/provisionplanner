// Reminders page. Users set a title, optional notes, and a date/time.
// Past-due reminders are highlighted so they're easy to spot.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Bell } from "lucide-react";
import { toast } from "sonner";

interface Reminder { id: string; title: string; notes: string | null; remind_at: string; completed: boolean; }

export default function RemindersPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Reminder[]>([]);
  const [open,  setOpen]  = useState(false);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [when,  setWhen]  = useState("");

  useEffect(() => { if (!authLoading && !user) navigate("/auth"); }, [user, authLoading, navigate]);

  async function loadReminders() {
    const { data } = await supabase.from("reminders").select("*").order("remind_at");
    setItems(data ?? []);
  }

  useEffect(() => { if (user) loadReminders(); }, [user]);

  async function addReminder(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !when) return;
    const { data, error } = await supabase.from("reminders").insert({
      user_id: user.id, title: title.trim(), notes: notes.trim() || null,
      remind_at: new Date(when).toISOString(),
    }).select().single();
    if (error) return toast.error(error.message);
    setItems((s) => [...s, data].sort((a, b) => a.remind_at.localeCompare(b.remind_at)));
    setOpen(false); setTitle(""); setNotes(""); setWhen("");
    toast.success("Reminder set!");
  }

  async function toggleReminder(r: Reminder) {
    const { error } = await supabase.from("reminders").update({ completed: !r.completed }).eq("id", r.id);
    if (error) return toast.error(error.message);
    setItems((s) => s.map((x) => x.id === r.id ? { ...x, completed: !x.completed } : x));
  }

  async function deleteReminder(id: string) {
    const { error } = await supabase.from("reminders").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setItems((s) => s.filter((x) => x.id !== id));
  }

  if (authLoading || !user) return null;

  const now = new Date();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold">Reminders</h1>
          <p className="mt-1 text-muted-foreground">A gentle nudge for the things that matter.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="warm"><Plus className="mr-1 h-4 w-4" /> New reminder</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New reminder</DialogTitle></DialogHeader>
            <form onSubmit={addReminder} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Pick up dry cleaning" />
              </div>
              <div className="space-y-1.5">
                <Label>Notes (optional)</Label>
                <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Remind me at</Label>
                <Input type="datetime-local" required value={when} onChange={(e) => setWhen(e.target.value)} />
              </div>
              <DialogFooter><Button variant="warm" type="submit">Save reminder</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <Card className="mt-10 border-dashed bg-card/60 p-12 text-center">
          <Bell className="mx-auto h-10 w-10 text-primary/70" />
          <p className="mt-3 text-muted-foreground">No reminders yet — add one above!</p>
        </Card>
      ) : (
        <div className="mt-8 space-y-2">
          {items.map((r) => {
            const isPastDue = !r.completed && new Date(r.remind_at) < now;
            return (
              <Card key={r.id} className={`flex items-center gap-3 p-4 ${r.completed ? "opacity-60" : ""} ${isPastDue ? "border-primary/60 bg-primary/5" : ""}`}>
                <Checkbox checked={r.completed} onCheckedChange={() => toggleReminder(r)} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${r.completed ? "line-through" : ""}`}>{r.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(r.remind_at).toLocaleString()}{r.notes && ` · ${r.notes}`}
                    {isPastDue && <span className="ml-2 font-medium text-primary">Past due</span>}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteReminder(r.id)}>
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
