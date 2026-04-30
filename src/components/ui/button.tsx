// ============================================================
// components/ui/button.tsx — Reusable Button component
// ============================================================
// Built with class-variance-authority (cva) for variant/size props.
// Variants:
//   default   — neutral outline style
//   warm      — terracotta fill (primary action)
//   outline   — border-only
//   ghost     — no border, hover background only
//   secondary — muted fill
//   destructive — red fill for delete actions
// ============================================================

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// cva generates the class string based on variant + size props
const buttonVariants = cva(
  // Base classes shared by all buttons
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Neutral solid button
        default:     "bg-primary text-primary-foreground hover:bg-primary/90",
        // Warm terracotta — main CTA style
        warm:        "bg-primary text-primary-foreground hover:bg-primary/85 shadow-sm",
        // Destructive action (delete, remove)
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        // Border-only button
        outline:     "border border-input bg-background hover:bg-accent/20 hover:text-accent-foreground",
        // Muted background fill
        secondary:   "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        // No background — only shows on hover
        ghost:       "hover:bg-accent/20 hover:text-accent-foreground",
        // Plain text link style
        link:        "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm:      "h-9 rounded-md px-3",
        lg:      "h-11 rounded-md px-8",
        icon:    "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size:    "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  // When asChild=true, renders as the child element instead of a <button>
  // Used for Link components: <Button asChild><Link to="/foo">Go</Link></Button>
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    // Slot renders as whatever child element is passed when asChild=true
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
