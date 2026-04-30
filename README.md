# Provision Planner

A warm, mobile-friendly household planning web app built with **React + TypeScript + Vite**.

## Features

- **Task & list management** — multiple named lists, due dates, priority levels
- **Weekly meal planning** — 7-day grid with breakfast, lunch, dinner, snack slots
- **Grocery list** — manually add items or auto-generate from your meal plan; grouped by category; printable
- **Pantry tracker** — mark staples as "low" and they appear on your grocery list automatically
- **Reminders** — set date/time reminders with optional notes
- **Daily verse** — a different Bible verse every day (rotates by UTC date); save favorites to your account

---

## Setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd provision-planner
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project.
2. In the **SQL Editor**, paste and run the contents of `schema.sql`.
3. Go to **Settings → API** and copy your **Project URL** and **anon/public key**.

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run the development server

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173).

### 5. Build for production

```bash
npm run build
```

The `dist/` folder can be deployed to any static host (Netlify, Vercel, Cloudflare Pages, etc.).

> **Important for SPA routing:** When deploying, configure your host to redirect all requests to `index.html`. On Netlify, add a `_redirects` file with `/* /index.html 200`. On Vercel, add `vercel.json` with rewrites.

---

## Project structure

```
src/
├── components/
│   ├── ui/            # Reusable UI primitives (Button, Card, Input, etc.)
│   ├── DailyVerseCard.tsx
│   ├── SiteHeader.tsx
│   └── SiteFooter.tsx
├── integrations/
│   └── supabase/
│       └── client.ts  # Supabase client setup
├── lib/
│   ├── auth.tsx       # Auth context + useAuth() hook
│   ├── utils.ts       # cn() class merge helper
│   └── verses.ts      # Built-in verse library + getDailyVerse()
├── pages/             # One file per route
│   ├── HomePage.tsx
│   ├── AuthPage.tsx
│   ├── DashboardPage.tsx
│   ├── TasksPage.tsx
│   ├── MealsPage.tsx
│   ├── GroceryPage.tsx
│   ├── PantryPage.tsx
│   ├── RemindersPage.tsx
│   ├── VersePage.tsx
│   ├── SettingsPage.tsx
│   └── NotFoundPage.tsx
├── App.tsx            # Route definitions
├── main.tsx           # Entry point
└── index.css          # Global styles + design tokens
```

---

## Tech stack

| Library | Purpose |
|---|---|
| React 18 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool + dev server |
| react-router-dom v6 | Client-side routing |
| Supabase | Database, auth, real-time |
| Tailwind CSS | Utility-first styling |
| Radix UI | Accessible headless components |
| sonner | Toast notifications |
| lucide-react | Icons |

No Lovable-specific packages are used.
