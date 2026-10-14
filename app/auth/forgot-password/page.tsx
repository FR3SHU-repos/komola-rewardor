"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { createAuthBrowserClient } from "@/shared/lib/supabase/auth-client";

const COOLDOWN = 60;

export default function ForgotPasswordPage() {
  const supabase = createAuthBrowserClient();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || cooldown > 0) return;
    setBusy(true);
    await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setBusy(false);
    setSent(true);
    setCooldown(COOLDOWN);
  }

  return <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-8">
    <section className="w-full max-w-md rounded-2xl border border-border bg-surface-card p-6 shadow-sm sm:p-8">
      <h1 className="text-xl font-black text-foreground-heading">Reset your password</h1>
      <p className="mt-2 text-sm leading-6 text-foreground-muted">Enter your Rewardor email and we’ll send you a secure password reset link.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="block text-sm font-semibold text-foreground-heading">Email<input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground-heading outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" /></label>
        <button type="submit" disabled={busy || cooldown > 0} className="min-h-11 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary-hover disabled:opacity-60">{busy ? "Sending…" : cooldown > 0 ? `Resend in ${cooldown}s` : "Send reset link"}</button>
      </form>
      {sent ? <p className="mt-4 rounded-lg bg-primary/5 px-3 py-3 text-sm text-foreground-body">If that email has a KOMOLA account, a reset link is on its way.</p> : null}
      <p className="mt-6 text-center text-sm text-foreground-muted"><Link href="/login" className="font-medium text-primary hover:underline">Back to Rewardor sign in</Link></p>
    </section>
  </main>;
}
