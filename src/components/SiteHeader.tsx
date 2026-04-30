// Sticky top navigation bar. Shows the brand, nav links for authenticated
// users, and sign-in / sign-out controls on the right.

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Sprout, LogOut } from "lucide-react";

const NAV_LINKS = [
  { to: "/dashboard",  label: "Dashboard"   },
  { to: "/tasks",      label: "Tasks"        },
  { to: "/meals",      label: "Meals"        },
  { to: "/grocery",    label: "Grocery"      },
  { to: "/pantry",     label: "Pantry"       },
  { to: "/reminders",  label: "Reminders"    },
  { to: "/verse",      label: "Daily Verse"  },
];

export function SiteHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-warm">
            <Sprout className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">
            Provision Planner
          </span>
        </Link>

        {/* Desktop nav — hidden on mobile */}
        <nav className="hidden items-center gap-5 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm text-foreground/80 transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth controls */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/settings">Settings</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button variant="warm" size="sm" asChild>
                <Link to="/auth?mode=signup">Get started</Link>
              </Button>
            </>
          )}
        </div>

      </div>
    </header>
  );
}
