// Dashboard — the first page a user sees after signing in.
// Fetches counts from each feature area in parallel and displays them as
// summary tiles. Also shows the daily verse card in compact mode.

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DailyVerseCard } from "@/components/DailyVerseCard";
import { ListChecks, UtensilsCrossed, ShoppingCart, Package, Bell, ArrowRight } from "lucide-react";

interface Counts {
  tasks: number; meals: number; grocery: number; pantryLow: number; reminders: number;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [counts, setCounts] = useState<Counts>({ tasks: 0, meals: 0, grocery: 0, pantryLow: 0, reminders: 0 });

  useEffect(() => { if (!loading && !user) navigate("/auth"); }, [user, loading, navigate]);

  // Fetch all counts in parallel — head: true returns the count without fetching rows
  useEffect(() => {
    if (!user) return;
    (async () => {
      const [t, m, g, p, r] = await Promise.all([
        supabase.from("tasks").select("id", { count: "exact", head: true }).eq("completed", false),
        supabase.from("meal_plan_entries").select("id", { count: "exact", head: true }),
        supabase.from("grocery_items").select("id", { count: "exact", head: true }).eq("checked", false),
        supabase.from("pantry_items").select("id", { count: "exact", head: true }).eq("is_low", true),
        supabase.from("reminders").select("id", { count: "exact", head: true }).eq("completed", false),
      ]);
      setCounts({ tasks: t.count ?? 0, meals: m.count ?? 0, grocery: g.count ?? 0, pantryLow: p.count ?? 0, reminders: r.count ?? 0 });
    })();
  }, [user]);

  if (loading || !user) return null;

  const tiles = [
    { to: "/tasks",     icon: ListChecks,     label: "Tasks",     value: `${counts.tasks} open`,             color: "from-primary/15 to-primary/5"  },
    { to: "/meals",     icon: UtensilsCrossed, label: "Meal Plan", value: `${counts.meals} meals this week`,  color: "from-accent/30 to-accent/10"   },
    { to: "/grocery",   icon: ShoppingCart,    label: "Grocery",   value: `${counts.grocery} items to buy`,   color: "from-secondary to-secondary/40" },
    { to: "/pantry",    icon: Package,         label: "Pantry",    value: `${counts.pantryLow} running low`,  color: "from-muted to-muted/40"        },
    { to: "/reminders", icon: Bell,            label: "Reminders", value: `${counts.reminders} pending`,      color: "from-primary/10 to-accent/20"  },
  ] as const;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-display text-4xl font-semibold">Welcome back</h1>
      <p className="mt-1 text-muted-foreground">Your provisions at a glance.</p>

      {/* Summary tiles */}
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tiles.map(({ to, icon: Icon, label, value, color }) => (
          <Link key={to} to={to}>
            <Card className={`group h-full bg-gradient-to-br ${color} p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-warm`}>
              <div className="flex items-center justify-between">
                <Icon className="h-6 w-6 text-primary" />
                <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1" />
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold">{label}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{value}</p>
            </Card>
          </Link>
        ))}
      </div>

      {/* Daily verse — compact mode hides the reflection */}
      <div className="mt-10 max-w-3xl">
        <DailyVerseCard compact />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button variant="warm" asChild><Link to="/meals">Plan this week</Link></Button>
        <Button variant="outline" asChild><Link to="/grocery">Open grocery list</Link></Button>
      </div>
    </div>
  );
}
