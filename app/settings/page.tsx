"use client";

import { Bell, Building2, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { RewardorShell } from "@/shared/components/RewardorShell";
import { getRewardorBootstrap, type RewardorBootstrap } from "@/shared/lib/api";

export default function Settings() {
  const [workspace, setWorkspace] = useState<RewardorBootstrap | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void getRewardorBootstrap().then((result) => {
      if (result.success && result.data) setWorkspace(result.data);
      else setError(result.message);
    });
  }, []);

  const user = workspace?.user;
  const organization = workspace?.organization;
  const organizationRecord = organization?.organization;
  const organizationName = organization?.displayName || organizationRecord?.displayName || "—";
  const supportPhone = organizationRecord?.phoneE164 || "Not configured";
  const roles = user?.roles?.join(", ") || organization?.membership?.roles?.join(", ") || user?.role || "—";

  return <RewardorShell>
    <header className="border-b border-border bg-surface-card px-5 py-5 sm:px-8"><p className="m-0 text-sm font-semibold text-foreground-muted">Shared KOMOLA identity and organization</p><h1 className="m-0 mt-1 text-2xl font-black text-foreground-heading">Settings</h1></header>
    <div className="max-w-3xl space-y-6 p-5 sm:p-8">
      {error ? <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
      <section className="rounded-2xl border border-border bg-surface-card p-6"><div className="flex items-start gap-4"><Building2 className="mt-1 text-primary" size={20}/><div className="flex-1"><h2 className="m-0 text-lg font-black text-foreground-heading">Rewardor profile</h2><p className="m-0 mt-1 text-sm text-foreground-muted">This information comes from the shared POS organization records.</p><div className="mt-5 grid gap-5 sm:grid-cols-2"><label className="text-sm font-bold text-foreground-heading">Organization name<input className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none" value={organizationName} readOnly/></label><label className="text-sm font-bold text-foreground-heading">Support phone<input className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none" value={supportPhone} readOnly/></label></div><p className="mt-4 text-xs font-semibold text-foreground-muted">Organization changes are managed through the KOMOLA POS organization settings. Rewardor does not create a second user or organization record.</p></div></div></section>
      <section className="rounded-2xl border border-border bg-surface-card p-6"><div className="flex items-start gap-4"><Bell className="mt-1 text-primary" size={20}/><div><h2 className="m-0 text-lg font-black text-foreground-heading">Signed-in account</h2><p className="m-0 mt-1 text-sm text-foreground-muted">The current user is the same Supabase and POS identity.</p><div className="mt-5 grid gap-5 sm:grid-cols-2"><div><p className="m-0 text-sm font-bold text-foreground-heading">Name</p><p className="mt-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground-heading">{user?.name || "—"}</p></div><div><p className="m-0 text-sm font-bold text-foreground-heading">Email</p><p className="mt-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground-heading">{user?.email || "—"}</p></div></div><p className="mt-4 text-xs font-semibold text-foreground-muted">Organization role: {roles}</p></div></div></section>
      <section className="rounded-2xl border border-border bg-surface-card p-6"><div className="flex items-start gap-4"><ShieldCheck className="mt-1 text-primary" size={20}/><div><h2 className="m-0 text-lg font-black text-foreground-heading">Access and moderation</h2><p className="m-0 mt-1 text-sm text-foreground-muted">Publishing access is resolved from your shared POS organization membership and status.</p><p className="mt-4 inline-flex rounded-full bg-status-success-surface px-3 py-1 text-xs font-bold text-status-success">{organizationRecord?.status === "active" ? "Approved organization" : organizationRecord?.status || "Loading access"}</p></div></div></section>
    </div>
  </RewardorShell>;
}
