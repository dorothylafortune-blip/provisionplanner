// Pantry tracker. Users log staple items they always want on hand.
// Toggling the "Low" switch marks the item as low stock and automatically
// adds it to the grocery list (if it isn't already there).

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Package } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = ["pantry", "produce", "dairy", "meat", "frozen", "household", "other"];

interface PantryItem { id: string; name: string; category: string; quantity: string | null; is_low: boolean; }

export default function PantryPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<PantryItem[]>([]);
  const [name, setName] = useState("");
  const [qty,  setQty]  = useState("");
  const [cat,  setCat]  = useState("pantry");

  useEffect(() => { if (!authLoading && !user) navigate("/auth"); }, [user, authLoading, navigate]);

  async function loadItems() {
    const { data } = await supabase.from("pantry_items").select("*").order("category").order("name");
    setItems(data ?? []);
  }

  useEffect(() => { if (user) loadItems(); }, [user]);

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !name.trim()) return;
    const { data, error } = await supabase.from("pantry_items").insert({
      user_id: user.id, name: name.trim().toLowerCase(), quantity: qty || null, category: cat,
    }).select().single();
    if (error) return toast.error(error.message);
    setItems((s) => [...s, data]);
    setName(""); setQty("");
    toast.success("Added to pantry!");
  }

  async function toggleLow(item: PantryItem) {
    const newLow = !item.is_low;
    const { error } = await supabase.from("pantry_items").update({ is_low: newLow }).eq("id", item.id);
    if (error) return toast.error(error.message);
    setItems((s) => s.map((x) => x.id === item.id ? { ...x, is_low: newLow } : x));

    // When marked low, add to the grocery list if not already present
    if (newLow && user) {
      const { data: existing } = await supabase.from("grocery_items").select("id").eq("name", item.name).eq("checked", false).maybeSingle();
      if (!existing) {
        await supabase.from("grocery_items").insert({ user_id: user.id, name: item.name, quantity: item.quantity, category: item.category, source: "pantry" });
        toast.success(`"${item.name}" added to your grocery list.`);
      } else {
        toast.info(`"${item.name}" is already on your grocery list.`);
      }
    }
  }

  async function deleteItem(id: string) {
    const { error } = await supabase.from("pantry_items").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setItems((s) => s.filter((x) => x.id !== id));
  }

  if (authLoading || !user) return null;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-display text-4xl font-semibold">Pantry basics</h1>
      <p className="mt-1 text-muted-foreground">Mark a staple as low and it joins your grocery list automatically.</p>

      <form onSubmit={addItem} className="mt-6 flex flex-wrap gap-2">
        <Input className="flex-1 min-w-40" placeholder="Pantry staple (e.g. flour)…" value={name} onChange={(e) => setName(e.target.value)} />
        <Input className="w-28" placeholder="Qty" value={qty} onChange={(e) => setQty(e.target.value)} />
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
        </Select>
        <Button type="submit" variant="warm"><Plus className="mr-1 h-4 w-4" /> Add</Button>
      </form>

      {items.length === 0 ? (
        <Card className="mt-10 border-dashed bg-card/60 p-12 text-center">
          <Package className="mx-auto h-10 w-10 text-primary/70" />
          <p className="mt-3 text-muted-foreground">Add the basics you always want on hand.</p>
        </Card>
      ) : (
        <div className="mt-8 grid gap-2 md:grid-cols-2">
          {items.map((item) => (
            <Card key={item.id} className={`flex items-center gap-3 p-4 ${item.is_low ? "border-primary/60 bg-primary/5" : ""}`}>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium capitalize">{item.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{item.category}{item.quantity ? ` · ${item.quantity}` : ""}</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className={item.is_low ? "font-medium text-primary" : "text-muted-foreground"}>Low</span>
                <Switch checked={item.is_low} onCheckedChange={() => toggleLow(item)} />
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteItem(item.id)}>
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
