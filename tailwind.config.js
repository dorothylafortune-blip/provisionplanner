/** @type {import('tailwindcss').Config} */

// This design system uses a warm, homey palette:
//   - Primary:    terracotta (#8B4A32 range)
//   - Secondary:  warm sand
//   - Accent:     honey/amber
//   - Fonts:      Fraunces (display/headings) + Inter (body)

export default {
  // Scan all source files for Tailwind class names
  content: ["./index.html", "./src/**/*.{ts,tsx}"],

  theme: {
    extend: {
      // CSS variable-based colors so they work with our :root definitions
      colors: {
        background:   "hsl(var(--background))",
        foreground:   "hsl(var(--foreground))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input:  "hsl(var(--input))",
        ring:   "hsl(var(--ring))",
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },

      // Display font for headings (Fraunces = the warm serif used in original)
      fontFamily: {
        display: ['"Fraunces"', '"Georgia"', "serif"],
        sans:    ['"Inter"', "system-ui", "sans-serif"],
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      // Custom shadow tokens matching the original warm/soft shadows
      boxShadow: {
        warm: "0 12px 32px -12px rgba(139, 74, 50, 0.35)",
        soft: "0 4px 18px -6px rgba(80, 50, 30, 0.18)",
      },
    },
  },

  plugins: [],
};
