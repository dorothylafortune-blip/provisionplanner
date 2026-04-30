// Public landing page. No authentication required.
// Introduces the app with a hero section, feature grid, and a sign-up CTA.

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CalendarDays, ListChecks, BookOpen, Sparkles, ShieldCheck, Bell } from "lucide-react";

const FEATURES = [
  { icon: CalendarDays, title: "Weekly meal planning",     body: "Build a 7-day meal plan with breakfast, lunch, dinner, and snack slots." },
  { icon: ListChecks,   title: "Task & list management",   body: "Multiple lists, due dates, priority levels, and one-tap completion." },
  { icon: BookOpen,     title: "Smart grocery list",       body: "Pull ingredients from your meal plan into a categorized, printable list." },
  { icon: Bell,         title: "Reminders",                body: "Set date/time reminders for anything worth remembering." },
  { icon: Sparkles,     title: "Daily verse",              body: "A different Bible verse every day, with a short reflection." },
  { icon: ShieldCheck,  title: "Pantry tracker",           body: "Mark a staple as low and it automatically joins your grocery list." },
];

export default function HomePage() {
  return (
    <div>

      {/* Hero */}
      <section className="container mx-auto grid items-center gap-12 px-4 pt-16 pb-20 md:grid-cols-2 md:pt-24">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent/40 px-3 py-1 text-xs font-medium text-accent-foreground">
            <Sparkles className="h-3.5 w-3.5" /> Your household, planned
          </span>
          <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            Plan the week.<br />
            <span className="italic text-primary">Lighten the load.</span>
          </h1>
          <p className="max-w-lg text-lg text-muted-foreground">
            Provision Planner is a warm, mobile-friendly home for your meals, shopping
            lists, household staples, and family routines — all in one place.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="warm" size="lg" asChild>
              <Link to="/auth?mode=signup">Start planning free</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/verse">See today's verse</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">No app store needed. Works in any browser, on any device.</p>
        </div>

        {/* Hero visual */}
        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-accent/20 blur-3xl" />
          <div className="aspect-[4/3] w-full rounded-[1.75rem] bg-gradient-warm shadow-warm flex items-center justify-center">
            <div className="text-center text-primary-foreground">
              <Sparkles className="mx-auto h-16 w-16 mb-4 opacity-80" />
              <p className="font-display text-3xl font-semibold">Your week,<br />beautifully planned.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold md:text-4xl">Everything for the everyday</h2>
          <p className="mt-3 text-muted-foreground">Built around the small, recurring decisions that quietly run a household.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="group border-border/60 p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-warm">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="container mx-auto px-4 py-16">
        <div className="overflow-hidden rounded-[1.75rem] bg-gradient-warm p-10 text-primary-foreground shadow-warm md:p-14">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-semibold md:text-4xl">Ready for a calmer week?</h2>
            <p className="mt-3 text-primary-foreground/90">Create your account and build your first weekly plan in under a minute.</p>
            <Button variant="secondary" size="lg" className="mt-6" asChild>
              <Link to="/auth?mode=signup">Create your free account</Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}
