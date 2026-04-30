// Sign-in and sign-up page. Mode is controlled by the ?mode=signup URL param.
// On successful sign-in, redirects to /dashboard.
// On sign-up, sends a Supabase confirmation email (if enabled in your project).

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Sprout } from "lucide-react";
import { toast } from "sonner";

type AuthMode = "signin" | "signup";

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [mode,        setMode]        = useState<AuthMode>((searchParams.get("mode") as AuthMode) ?? "signin");
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading,     setLoading]     = useState(false);

  // Already signed in — redirect immediately
  useEffect(() => { if (user) navigate("/dashboard"); }, [user, navigate]);

  // Show a success message when the user returns after confirming their email
  useEffect(() => {
    if (searchParams.get("confirmed")) toast.success("Email confirmed! You can sign in now.");
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth?confirmed=true`,
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        if (!data.session) {
          // Email confirmation required — prompt the user to check their inbox
          toast.success("Check your email to confirm your account, then sign in.");
          setMode("signin");
          setPassword("");
        } else {
          toast.success("Welcome! You're all set.");
          navigate("/dashboard");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordReset() {
    if (!email.trim()) { toast.error("Enter your email address first."); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("Password reset email sent — check your inbox.");
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-warm">
            <Sprout className="h-7 w-7" />
          </div>
          <h1 className="font-display text-3xl font-semibold">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signup" ? "Start planning your household in minutes." : "Sign in to your Provision Planner account."}
          </p>
        </div>

        <Card className="p-6 shadow-soft">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="displayName">Your name (optional)</Label>
                <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="e.g. Sarah" />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === "signup" ? "At least 6 characters" : ""} />
            </div>
            <Button type="submit" variant="warm" className="w-full" disabled={loading}>
              {loading ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
            </Button>
          </form>

          {mode === "signin" && (
            <button type="button" onClick={handlePasswordReset} className="mt-3 w-full text-center text-xs text-muted-foreground underline-offset-4 hover:underline">
              Forgot your password?
            </button>
          )}
        </Card>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {mode === "signup" ? (
            <>Already have an account?{" "}<button type="button" onClick={() => setMode("signin")} className="font-medium text-primary hover:underline">Sign in</button></>
          ) : (
            <>Don't have an account?{" "}<button type="button" onClick={() => setMode("signup")} className="font-medium text-primary hover:underline">Sign up free</button></>
          )}
        </p>

      </div>
    </div>
  );
}
