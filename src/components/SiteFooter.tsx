// Page footer with a contact/help bar and a standard bottom strip.
// Update SUPPORT_EMAIL to your real address before deploying.

import { Link } from "react-router-dom";
import { Mail, MessageSquare } from "lucide-react";

const SUPPORT_EMAIL = "support@provisionplanner.com";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60">

      {/* Contact bar */}
      <div className="bg-secondary/30 border-b border-border/40">
        <div className="container mx-auto flex flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Having trouble with the site?</p>
              <p className="text-sm text-muted-foreground">
                Email us at{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-primary hover:underline">
                  {SUPPORT_EMAIL}
                </a>
                {" "}and we'll get back to you as soon as we can.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent-foreground">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Got feedback?</p>
              <p className="text-sm text-muted-foreground">
                We'd love to hear what's working and what isn't.{" "}
                <a
                  href={`mailto:${SUPPORT_EMAIL}?subject=Provision Planner Feedback`}
                  className="font-medium text-primary hover:underline"
                >
                  Send us a note
                </a>.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom strip */}
      <div className="bg-secondary/40">
        <div className="container mx-auto flex flex-col gap-3 px-4 py-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Provision Planner. Made with care for households.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/grocery" className="hover:text-foreground">Grocery list</Link>
            <Link to="/verse"   className="hover:text-foreground">Daily verse</Link>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-foreground">Contact</a>
            <span className="font-display italic">"A plan is the warmest pantry."</span>
          </div>
        </div>
      </div>

    </footer>
  );
}
