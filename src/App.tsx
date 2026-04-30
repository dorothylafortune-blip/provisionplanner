// App.tsx — Root component. Defines all routes and wraps the app in
// AuthProvider (global auth state) and Toaster (toast notifications).
//
// Route structure:
//   /            → public landing page
//   /auth        → sign in / sign up
//   /verse       → daily verse (public)
//   /dashboard   → overview (protected)
//   /tasks       → task & list management (protected)
//   /meals       → weekly meal planner (protected)
//   /grocery     → grocery list (protected)
//   /pantry      → pantry tracker (protected)
//   /reminders   → reminders (protected)
//   /settings    → account settings (protected)
//   *            → 404

import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { SiteHeader }   from "@/components/SiteHeader";
import { SiteFooter }   from "@/components/SiteFooter";
import { Toaster }      from "@/components/ui/toaster";

import HomePage      from "@/pages/HomePage";
import AuthPage      from "@/pages/AuthPage";
import DashboardPage from "@/pages/DashboardPage";
import TasksPage     from "@/pages/TasksPage";
import MealsPage     from "@/pages/MealsPage";
import GroceryPage   from "@/pages/GroceryPage";
import PantryPage    from "@/pages/PantryPage";
import RemindersPage from "@/pages/RemindersPage";
import VersePage     from "@/pages/VersePage";
import SettingsPage  from "@/pages/SettingsPage";
import NotFoundPage  from "@/pages/NotFoundPage";

export default function App() {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <Routes>
            {/* Public */}
            <Route path="/"      element={<HomePage />} />
            <Route path="/auth"  element={<AuthPage />} />
            <Route path="/verse" element={<VersePage />} />

            {/* Protected — each page handles its own auth redirect */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tasks"     element={<TasksPage />} />
            <Route path="/meals"     element={<MealsPage />} />
            <Route path="/grocery"   element={<GroceryPage />} />
            <Route path="/pantry"    element={<PantryPage />} />
            <Route path="/reminders" element={<RemindersPage />} />
            <Route path="/settings"  element={<SettingsPage />} />

            {/* Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <SiteFooter />
      </div>
      <Toaster />
    </AuthProvider>
  );
}
