"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, HelpCircle, Mail, Send } from "lucide-react";
import { RewardorShell } from "@/shared/components/RewardorShell";

const SUPPORT_EMAIL = "varma.v.business@gmail.com";

export default function SupportPage() {
  const [sent, setSent] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const issueType = String(form.get("issueType") || "Other");
    const subject = String(form.get("subject") || "KOMOLA support request");
    const details = String(form.get("details") || "");
    const reference = String(form.get("reference") || "");
    const body = [`Issue type: ${issueType}`, `Reference: ${reference || "Not provided"}`, "", details].join("\n");
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`[KOMOLA Rewardor support] ${subject}`)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  return <RewardorShell><main className="min-h-screen bg-surface px-5 py-8 sm:px-8"><section className="mx-auto max-w-3xl"><Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"><ArrowLeft size={16}/> Back to workspace</Link><div className="mt-7 rounded-3xl border border-border bg-surface-card p-6 sm:p-10"><div className="flex items-start gap-4"><span className="rounded-2xl bg-secondary p-3 text-primary"><HelpCircle size={26}/></span><div><p className="m-0 text-xs font-bold uppercase tracking-wider text-primary">KOMOLA support</p><h1 className="m-0 mt-2 text-3xl font-black text-foreground-heading">Tell us what went wrong</h1><p className="mt-3 leading-7 text-foreground-muted">Prepare an issue email for the KOMOLA team. Do not include passwords, one-time codes, or payment secrets.</p></div></div><form onSubmit={submit} className="mt-8 space-y-5"><label className="block text-sm font-bold text-foreground-heading">Issue type<select name="issueType" className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 font-normal outline-none focus:border-border-focus"><option>Login or account access</option><option>Campaign or claim</option><option>Organization or seller setup</option><option>Analytics</option><option>Privacy request</option><option>Other</option></select></label><label className="block text-sm font-bold text-foreground-heading">Subject<input required name="subject" className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 font-normal outline-none focus:border-border-focus" placeholder="Briefly describe the issue"/></label><label className="block text-sm font-bold text-foreground-heading">What happened?<textarea required name="details" rows={6} className="mt-2 w-full resize-y rounded-xl border border-border bg-surface px-4 py-3 font-normal outline-none focus:border-border-focus" placeholder="Tell us what you expected, what happened, and when it happened."/></label><label className="block text-sm font-bold text-foreground-heading">Reference (optional)<input name="reference" className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 font-normal outline-none focus:border-border-focus" placeholder="Campaign, claim, or account reference"/></label><div className="flex flex-wrap items-center gap-4"><button type="submit" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground hover:bg-primary-hover"><Send size={16}/> Email support</button><a href={`mailto:${SUPPORT_EMAIL}`} className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-border px-5 py-3 font-bold text-primary hover:bg-surface"><Mail size={16}/> {SUPPORT_EMAIL}</a></div>{sent ? <p role="status" className="rounded-xl bg-status-success-surface px-4 py-3 text-sm font-semibold text-status-success">Your email app should now contain the support request. If it did not open, email {SUPPORT_EMAIL} directly.</p> : null}</form></div></section></main></RewardorShell>;
}
