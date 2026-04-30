// Grocery list page. Items can be added manually or arrive automatically
// from the meal planner ("meal" source) and pantry tracker ("pantry" source).
// Items are grouped by category and the list is printable.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ShoppingCart, Printer } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = ["produce", "dairy", "meat", "pantry", "frozen", "bakery", "household", "other"];

interface GroceryItem {
  id: string; name: string; quantity: string | null;
  category: string; source: string; checked: boolean;
}

export default function GroceryPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [name, setName] = useState("");
  const [qty,  setQty]  = useState("");
  const [cat,  setCat]  = useState("other");

  useEffect(() => { if (!authLoading && !user) navigate("/auth"); }, [user, authLoading, navigate]);

  async function loadItems() {
    const { data } = await supabase.from("grocery_items").select("*").order("checked").order("category").order("name");
    setItems(data ?? []);
  }

  useEffect(() => { if (user) loadItems(); }, [user]);

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !name.trim()) return;
    const { data, error } = await supabase.from("grocery_items").insert({
      user_id: user.id, name: name.trim().toLowerCase(), quantity: qty || null, category: cat, source: "manual",
    }).select().single();
    if (error) return toast.error(error.message);
    setItems((s) => [...s, data]);
    setName(""); setQty("");
  }

  async function toggleItem(item: GroceryItem) {
    const { error } = await supabase.from("grocery_items").update({ checked: !item.checked }).eq("id", item.id);
    if (error) return toast.error(error.message);
    setItems((s) => s.map((x) => x.id === item.id ? { ...x, checked: !x.checked } : x));
  }

  async function removeItem(id: string) {
    const { error } = await supabase.from("grocery_items").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setItems((s) => s.filter((x) => x.id !== id));
  }

  async function clearChecked() {
    if (!confirm("Remove all checked items?")) return;
    const ids = items.filter((i) => i.checked).map((i) => i.id);
    if (!ids.length) return;
    const { error } = await supabase.from("grocery_items").delete().in("id", ids);
    if (error) return toast.error(error.message);
    setItems((s) => s.filter((x) => !x.checked));
    toast.success("Checked items cleared.");
  }

  if (authLoading || !user) return null;

  const grouped = items.reduce<Record<string, GroceryItem[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  return (
    <div className="container mx-auto px-4 py-12 print:py-4">
      <div className="flex flex-wrap items-end justify-between gap-4 print:hidden">
        <div>
          <h1 className="font-display text-4xl font-semibold">Grocery list</h1>
          <p className="mt-1 text-muted-foreground">Auto-built from meals & pantry, plus anything you add manually.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}><Printer className="mr-1 h-4 w-4" /> Print</Button>
          <Button variant="ghost" onClick={clearChecked}>Clear checked</Button>
        </div>
      </div>

      <form onSubmit={addItem} className="mt-6 flex flex-wrap gap-2 print:hidden">
        <Input className="flex-1 min-w-40" placeholder="Add item…" value={name} onChange={(e) => setName(e.target.value)} />
        <Input className="w-28" placeholder="Qty" value={qty} onChange={(e) => setQty(e.target.value)} />
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
        </Select>
        <Button type="submit" variant="warm"><Plus className="mr-1 h-4 w-4" /> Add</Button>
      </form>

      {items.length === 0 ? (
        <Card className="mt-10 border-dashed bg-card/60 p-12 text-center">
          <ShoppingCart className="mx-auto h-10 w-10 text-primary/70" />
          <p className="mt-3 text-muted-foreground">Your grocery list is empty. Add items above or build from your meal plan.</p>
        </Card>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {CATEGORIES.filter((c) => grouped[c]?.length).map((c) => (
            <Card key={c} className="p-5 shadow-soft">
              <h3 className="font-display text-lg font-semibold capitalize">{c}</h3>
              <ul className="mt-3 space-y-1.5">
                {grouped[c].map((item) => (
                  <li key={item.id} className={`flex items-center gap-3 rounded-md px-2 py-1.5 ${item.checked ? "opacity-50" : ""}`}>
                    <Checkbox checked={item.checked} onCheckedChange={() => toggleItem(item)} />
                    <span className={`flex-1 text-sm capitalize ${item.checked ? "line-through" : ""}`}>
                      {item.name}{item.quantity && <span className="text-muted-foreground"> · {item.quantity}</span>}
                    </span>
                    {item.source !== "manual" && <Badge variant="secondary" className="text-xs">{item.source}</Badge>}
                    <button onClick={() => removeItem(item.id)} className="print:hidden">
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
