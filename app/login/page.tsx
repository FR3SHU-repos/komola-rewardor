"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Gift, Loader2 } from "lucide-react";
import { createAuthBrowserClient } from "@/shared/lib/supabase/auth-client";

function safeNext(value: string | null): string {
  return value && value.startsWith("/") && !value.startsWith("//") && !value.includes("://") ? value : "/";
}

function googleEnabled(): boolean {
  return process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true";
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const { error: authError } = await createAuthBrowserClient().auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (authError) {
      setBusy(false);
      setError(/email not confirmed/i.test(authError.message) ? "Please verify your email first." : "Invalid email or password.");
      return;
    }
    router.replace(safeNext(params.get("next")));
    router.refresh();
  }

  async function signInWithGoogle() {
    if (googleBusy) return;
    setGoogleBusy(true);
    setError("");
    const redirectTo = new URL("/auth/callback", window.location.origin);
    redirectTo.searchParams.set("next", safeNext(params.get("next")));
    const { error: authError } = await createAuthBrowserClient().auth.signInWithOAuth({ provider: "google", options: { redirectTo: redirectTo.toString() } });
    if (authError) {
      setGoogleBusy(false);
      setError("Google sign-in is temporarily unavailable.");
    }
  }

  const posUrl = (process.env.NEXT_PUBLIC_KOMOLA_POS_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-8">
    <section className="w-full max-w-md rounded-2xl border border-border bg-surface-card p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex flex-col items-center text-center"><span className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground"><Gift className="h-6 w-6" /></span><p className="mt-3 text-lg font-black tracking-tight text-foreground-heading">KOMOLA</p><h1 className="mt-1 text-xl font-black text-foreground-heading">Sign in to Rewardor</h1><p className="mt-1 text-sm text-foreground-muted">Use your shared KOMOLA account to manage campaigns.</p></div>
      <div className="mb-5 rounded-xl bg-surface px-4 py-3 text-center"><p className="font-semibold text-foreground-heading">Rewardor workspace</p><p className="mt-1 text-xs text-foreground-muted">Your access comes from an active KOMOLA POS organization.</p></div>
      {params.get("error") === "auth_callback" ? <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">Sign-in could not be completed. Please try again.</p> : null}
      {googleEnabled() ? <><button type="button" onClick={() => void signInWithGoogle()} disabled={googleBusy} className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-surface py-3 text-sm font-medium text-foreground-heading transition hover:bg-surface-card disabled:opacity-60">{googleBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleGlyph />} {googleBusy ? "Connecting…" : "Continue with Google"}</button><div className="flex items-center gap-3 py-3"><span className="h-px flex-1 bg-border" /><span className="text-xs text-foreground-muted">or</span><span className="h-px flex-1 bg-border" /></div></> : null}
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-semibold text-foreground-heading">Email<input className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground-heading outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <label className="block text-sm font-semibold text-foreground-heading">Password<div className="relative mt-1.5"><input className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 pr-11 text-sm text-foreground-heading outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-foreground-muted hover:text-foreground-heading">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
        {error ? <p role="alert" aria-live="polite" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        <button type="submit" disabled={busy} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary-hover disabled:opacity-60">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{busy ? "Signing in…" : "Sign in"}</button>
      </form>
      <a href={`${posUrl}/auth/forgot-password`} className="mt-4 block text-center text-xs font-medium text-primary hover:underline">Forgot password?</a>
      <p className="mt-5 text-center text-xs text-foreground-muted">Need an account? <Link href="/register" className="font-medium text-primary hover:underline">Register for Rewardor</Link></p>
      <p className="mt-3 text-center text-xs text-foreground-muted">POS account already exists? <a href={`${posUrl}/login/seller`} className="font-medium text-primary hover:underline">Sign in through POS</a></p>
    </section>
  </main>;
}

function GoogleGlyph() {
  return <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"/><path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"/></svg>;
}

export default function LoginPage() {
  return <Suspense fallback={<main className="grid min-h-screen place-items-center bg-surface p-4"><p className="text-sm font-semibold text-foreground-muted">Loading sign-in…</p></main>}><LoginForm /></Suspense>;
}
