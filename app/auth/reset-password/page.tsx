"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createAuthBrowserClient } from "@/shared/lib/supabase/auth-client";

function ResetPasswordForm() {
  const router = useRouter();
  const supabase = createAuthBrowserClient();
  const [ready, setReady] = useState(false);
  const [valid, setValid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) setValid(true);
      setReady(true);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setValid(true);
      setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError("");
    if (password.length < 8) return setError("Choose a password with at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setBusy(false);
      setError("This reset link is invalid or has expired.");
      return;
    }
    await supabase.auth.signOut();
    setSuccess(true);
    setBusy(false);
    window.setTimeout(() => router.replace("/login"), 1200);
  }

  return <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-8">
    <section className="w-full max-w-md rounded-2xl border border-border bg-surface-card p-6 shadow-sm sm:p-8">
      <h1 className="text-xl font-black text-foreground-heading">Set a new password</h1>
      {!ready ? <p className="mt-4 text-sm text-foreground-muted">Checking your reset link…</p> : !valid ? <><p className="mt-4 rounded-lg bg-red-50 px-3 py-3 text-sm text-red-700">This reset link is invalid or expired.</p><Link href="/auth/forgot-password" className="mt-5 block text-center text-sm font-medium text-primary hover:underline">Request a new link</Link></> : success ? <p className="mt-4 rounded-lg bg-green-50 px-3 py-3 text-sm text-green-700">Password updated. Returning to Rewardor sign in…</p> : <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="block text-sm font-semibold text-foreground-heading">New password<input type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground-heading outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" /></label>
        <label className="block text-sm font-semibold text-foreground-heading">Confirm new password<input type="password" autoComplete="new-password" minLength={8} required value={confirm} onChange={(event) => setConfirm(event.target.value)} className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground-heading outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" /></label>
        {error ? <p role="alert" className="rounded-lg bg-red-50 px-3 py-3 text-sm text-red-700">{error}</p> : null}
        <button type="submit" disabled={busy} className="min-h-11 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary-hover disabled:opacity-60">{busy ? "Updating…" : "Update password"}</button>
      </form>}
    </section>
  </main>;
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<main className="grid min-h-screen place-items-center bg-surface p-4"><p className="text-sm font-semibold text-foreground-muted">Loading password reset…</p></main>}><ResetPasswordForm /></Suspense>;
}
