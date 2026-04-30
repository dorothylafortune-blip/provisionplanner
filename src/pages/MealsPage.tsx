// Weekly meal planner. Users build a 7-day grid of meals, then click
// "Build grocery list" to extract all ingredients into grocery_items.
//
// AI suggestions are fetched via a Supabase Edge Function (suggest-meals)
// which proxies the Claude API server-side — this avoids CORS issues and
// keeps the API key out of the browser.

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, ChevronLeft, ChevronRight, ShoppingCart, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

const DAYS       = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

interface MealEntry {
  id: string; week_id: string; day_of_week: number;
  meal_type: string; name: string; notes: string | null; ingredients: string | null;
}

interface Suggestion { name: string; description: string; ingredients: string; }

function getMonday(d = new Date()): string {
  const diff = (d.getDay() + 6) % 7;
  const mon  = new Date(d);
  mon.setDate(d.getDate() - diff);
  return mon.toISOString().slice(0, 10);
}

function shiftWeek(weekStart: string, delta: number): string {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + delta * 7);
  return d.toISOString().slice(0, 10);
}

// Calls the Supabase Edge Function, which proxies the request to Claude.
// Using an Edge Function avoids CORS restrictions and keeps the API key secure.
async function fetchMealSuggestions(query: string): Promise<Suggestion[]> {
  const { data, error } = await supabase.functions.invoke("suggest-meals", {
    body: { query },
  });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data?.suggestions ?? [];
}

export default function MealsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [weekStart, setWeekStart] = useState(getMonday());
  const [weekId,    setWeekId]    = useState<string | null>(null);
  const [entries,   setEntries]   = useState<MealEntry[]>([]);

  const [open,        setOpen]        = useState(false);
  const [dayIndex,    setDayIndex]    = useState(0);
  const [mealType,    setMealType]    = useState("dinner");
  const [mealName,    setMealName]    = useState("");
  const [ingredients, setIngredients] = useState("");
  const [notes,       setNotes]       = useState("");

  const [suggestOpen, setSuggestOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [sugLoading,  setSugLoading]  = useState(false);
  const [sugMealType, setSugMealType] = useState("dinner");
  const [sugDayIndex, setSugDayIndex] = useState(0);

  useEffect(() => { if (!authLoading && !user) navigate("/auth"); }, [user, authLoading, navigate]);
  useEffect(() => { if (user) loadWeek(); }, [user, weekStart]);

  async function loadWeek() {
    const { data: existing } = await supabase.from("meal_plan_weeks").select("id").eq("week_start", weekStart).maybeSingle();
    if (existing) {
      setWeekId(existing.id);
      const { data } = await supabase.from("meal_plan_entries").select("*").eq("week_id", existing.id);
      setEntries(data ?? []);
    } else {
      setWeekId(null); setEntries([]);
    }
  }

  async function ensureWeekRow(): Promise<string | null> {
    if (!user) return null;
    if (weekId) return weekId;
    const { data, error } = await supabase.from("meal_plan_weeks").insert({ user_id: user.id, week_start: weekStart }).select().single();
    if (error) { toast.error(error.message); return null; }
    setWeekId(data.id);
    return data.id;
  }

  function openAddDialog(dayIdx: number, type: string) {
    setDayIndex(dayIdx); setMealType(type);
    setMealName(""); setIngredients(""); setNotes("");
    setOpen(true);
  }

  async function addMeal(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const wid = await ensureWeekRow();
    if (!wid) return;
    const { data, error } = await supabase.from("meal_plan_entries").insert({
      user_id: user.id, week_id: wid, day_of_week: dayIndex, meal_type: mealType,
      name: mealName.trim(), ingredients: ingredients || null, notes: notes || null,
    }).select().single();
    if (error) return toast.error(error.message);
    setEntries((s) => [...s, data]);
    setOpen(false);
  }

  async function removeMeal(id: string) {
    const { error } = await supabase.from("meal_plan_entries").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setEntries((s) => s.filter((x) => x.id !== id));
  }

  async function buildGroceryList() {
    if (!user || !weekId) return toast.info("Add some meals first.");
    const all    = entries.flatMap((e) => (e.ingredients ?? "").split(/[,\n]/).map((s) => s.trim().toLowerCase()).filter(Boolean));
    const unique = Array.from(new Set(all));
    if (unique.length === 0) return toast.info("Add ingredients to your meals first.");
    const { data: existing } = await supabase.from("grocery_items").select("name").eq("week_id", weekId);
    const existingNames = new Set((existing ?? []).map((x) => x.name.toLowerCase()));
    const newRows = unique.filter((n) => !existingNames.has(n)).map((name) => ({ user_id: user.id, week_id: weekId, name, source: "meal", category: "produce" }));
    if (newRows.length === 0) return toast.info("Grocery list already includes all these ingredients.");
    const { error } = await supabase.from("grocery_items").insert(newRows);
    if (error) return toast.error(error.message);
    toast.success(`Added ${newRows.length} ingredients to your grocery list!`);
  }

  function openSuggestDialog(dayIdx: number, type: string) {
    setSugDayIndex(dayIdx); setSugMealType(type);
    setSearchQuery(""); setSuggestions([]);
    setSuggestOpen(true);
  }

  async function handleFetchSuggestions() {
    if (!searchQuery.trim()) return toast.error("Type something to search for first.");
    setSugLoading(true); setSuggestions([]);
    try {
      const results = await fetchMealSuggestions(searchQuery);
      setSuggestions(results);
      if (!results.length) toast.info("No suggestions returned — try different keywords.");
    } catch (err) {
      toast.error("Couldn't fetch suggestions. Make sure the Edge Function is deployed.");
      console.error(err);
    } finally {
      setSugLoading(false);
    }
  }

  function useSuggestion(s: Suggestion) {
    setDayIndex(sugDayIndex); setMealType(sugMealType);
    setMealName(s.name); setIngredients(s.ingredients); setNotes(s.description);
    setSuggestOpen(false); setOpen(true);
  }

  if (authLoading || !user) return null;

  return (
    <div className="container mx-auto px-4 py-12">

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold">Meal plan</h1>
          <p className="mt-1 text-muted-foreground">Plan the week, then build a grocery list from it.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setWeekStart(shiftWeek(weekStart, -1))}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="rounded-md bg-muted px-3 py-1.5 text-sm font-medium">
            Week of {new Date(weekStart + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </span>
          <Button variant="ghost" size="icon" onClick={() => setWeekStart(shiftWeek(weekStart, 1))}><ChevronRight className="h-4 w-4" /></Button>
          <Button variant="outline" onClick={() => openSuggestDialog(0, "dinner")}>
            <Sparkles className="mr-1 h-4 w-4" /> Suggest meals
          </Button>
          <Button variant="warm" onClick={buildGroceryList}>
            <ShoppingCart className="mr-1 h-4 w-4" /> Build grocery list
          </Button>
        </div>
      </div>

      {/* 7-day grid */}
      <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {DAYS.map((dayName, dIdx) => (
          <Card key={dIdx} className="p-4 shadow-soft">
            <h3 className="font-display text-lg font-semibold">{dayName}</h3>
            <div className="mt-3 space-y-3">
              {MEAL_TYPES.map((type) => {
                const meal = entries.find((e) => e.day_of_week === dIdx && e.meal_type === type);
                return (
                  <div key={type}>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{type}</p>
                    {meal ? (
                      <div className="mt-1 flex items-start justify-between gap-2 rounded-md bg-muted/50 px-2 py-1.5">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{meal.name}</p>
                          {meal.notes && <p className="text-xs text-muted-foreground truncate">{meal.notes}</p>}
                        </div>
                        <button onClick={() => removeMeal(meal.id)} className="flex-shrink-0">
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                        </button>
                      </div>
                    ) : (
                      <div className="mt-1 flex gap-1">
                        <button onClick={() => openAddDialog(dIdx, type)} className="flex-1 rounded-md border border-dashed border-border px-2 py-1.5 text-left text-xs text-muted-foreground hover:bg-muted transition">
                          + Add
                        </button>
                        <button onClick={() => openSuggestDialog(dIdx, type)} title="Get AI suggestions" className="rounded-md border border-dashed border-border px-2 py-1.5 text-muted-foreground hover:bg-muted transition">
                          <Sparkles className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        Tip: add ingredients to each meal (comma-separated), then click <strong>Build grocery list</strong> to send them to your{" "}
        <Link to="/grocery" className="text-primary hover:underline">grocery list</Link>.
      </p>

      {/* Add meal dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add {mealType} for {DAYS[dayIndex]}</DialogTitle></DialogHeader>
          <form onSubmit={addMeal} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Meal name</Label>
              <Input required value={mealName} onChange={(e) => setMealName(e.target.value)} placeholder="e.g. Chicken stir-fry" />
            </div>
            <div className="space-y-1.5">
              <Label>Ingredients (comma-separated)</Label>
              <Textarea value={ingredients} onChange={(e) => setIngredients(e.target.value)} placeholder="chicken, rice, soy sauce, broccoli" />
            </div>
            <div className="space-y-1.5">
              <Label>Notes (optional)</Label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. marinate overnight" />
            </div>
            <DialogFooter><Button variant="warm" type="submit"><Plus className="mr-1 h-4 w-4" /> Add meal</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* AI suggest dialog */}
      <Dialog open={suggestOpen} onOpenChange={setSuggestOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Suggest meals
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Type an ingredient, cuisine, or mood — the AI will suggest 5 meal ideas. Tap one to add it to your plan.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Day</Label>
              <Select value={String(sugDayIndex)} onValueChange={(v) => setSugDayIndex(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{DAYS.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Meal type</Label>
              <Select value={sugMealType} onValueChange={setSugMealType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{MEAL_TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. chicken, vegetarian, Italian, quick 30-min…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFetchSuggestions()}
            />
            <Button variant="warm" onClick={handleFetchSuggestions} disabled={sugLoading}>
              {sugLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            </Button>
          </div>
          {sugLoading && (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Thinking up some ideas…
            </div>
          )}
          {suggestions.length > 0 && (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              <p className="text-xs text-muted-foreground">Tap a meal to add it to <strong>{DAYS[sugDayIndex]}</strong> {sugMealType}.</p>
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => useSuggestion(s)} className="w-full rounded-lg border border-border bg-card p-3 text-left transition hover:border-primary hover:bg-muted/50">
                  <p className="font-medium text-sm">{s.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{s.description}</p>
                  <p className="mt-1.5 text-xs text-muted-foreground"><span className="font-medium text-foreground">Ingredients:</span> {s.ingredients}</p>
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
