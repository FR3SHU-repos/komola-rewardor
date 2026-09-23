"use client";

import Link from "next/link";
import { ArrowUpRight, Gift, Megaphone, Plus, Users, WalletCards } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { RewardorShell } from "@/shared/components/RewardorShell";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { getRewardorOverview, listRewardCampaigns, type RewardCampaign, type RewardorOverview } from "@/shared/lib/api";
import { createAuthBrowserClient } from "@/shared/lib/supabase/auth-client";

const emptyOverview: RewardorOverview = { campaigns: 0, publishedCampaigns: 0, draftCampaigns: 0, pausedCampaigns: 0, archivedCampaigns: 0, totalClaimsAllowed: 0, potentialPoints: 0 };

export default function Home() {
  const [overview, setOverview] = useState<RewardorOverview>(emptyOverview);
  const [campaigns, setCampaigns] = useState<RewardCampaign[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    void Promise.all([getRewardorOverview(), listRewardCampaigns()]).then(([summary, campaignsResult]) => {
      if (!alive) return;
      if (summary.success && summary.data) setOverview(summary.data);
      if (campaignsResult.success && campaignsResult.data) setCampaigns(campaignsResult.data.items);
      if (!summary.success || !campaignsResult.success) setError(summary.message || campaignsResult.message);
      setLoading(false);
    });
    return () => { alive = false; };
  }, []);

  const published = useMemo(() => campaigns.filter((campaign) => campaign.status === "published"), [campaigns]);
  const recent = campaigns.slice(0, 4);
  const dateLabel = new Intl.DateTimeFormat("en-IN", { dateStyle: "full" }).format(new Date());

  async function signOutForAccountSwitch() {
    await createAuthBrowserClient().auth.signOut();
    window.localStorage.removeItem("komola:rewardor-organization-id");
    window.location.assign("/login?next=/");
  }

  return <RewardorShell>
    <header className="flex items-center justify-between border-b border-border bg-surface-card px-5 py-5 sm:px-8"><div><p className="m-0 text-sm font-semibold text-foreground-muted">{dateLabel}</p><h1 className="m-0 mt-1 text-2xl font-black tracking-tight text-foreground-heading sm:text-3xl">Rewardor overview</h1></div><Link href="/campaigns/new" className="hidden items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-primary-hover sm:flex"><Plus size={17}/> New campaign</Link></header>
    <div className="space-y-8 p-5 sm:p-8">
      <section className="rounded-3xl bg-primary p-6 text-primary-foreground sm:p-8"><div className="max-w-2xl"><p className="mb-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider">Rewardor workspace</p><h2 className="m-0 text-2xl font-black tracking-tight sm:text-4xl">Turn every good choice into a reason to come back.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/75">Create Komola points campaigns, reach the right buyers, and track your campaign lifecycle from one protected workspace.</p><Link href="/campaigns/new" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-bold text-primary hover:opacity-90">Create a reward <ArrowUpRight size={17}/></Link></div></section>
      {error ? <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"><p className="m-0">{error}</p>{/not linked to an active Rewardor organization/i.test(error) ? <div className="mt-4 flex flex-wrap items-center gap-3"><button type="button" onClick={() => void signOutForAccountSwitch()} className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">Sign out and use another account</button><Link href="/register" className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-700">Create a Rewardor organization</Link></div> : null}</div> : null}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={<Megaphone size={18}/>} label="Campaigns" value={loading ? "—" : String(overview.campaigns)} detail={`${overview.publishedCampaigns} published`} />
        <Metric icon={<Users size={18}/>} label="Total claims allowed" value={loading ? "—" : overview.totalClaimsAllowed.toLocaleString("en-IN")} detail={`${overview.draftCampaigns} draft`} />
        <Metric icon={<Gift size={18}/>} label="Published campaigns" value={loading ? "—" : String(overview.publishedCampaigns)} detail={`${overview.pausedCampaigns} paused`} />
        <Metric icon={<WalletCards size={18}/>} label="Potential points" value={loading ? "—" : overview.potentialPoints.toLocaleString("en-IN")} detail="Maximum campaign allocation" />
      </section>
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-border bg-surface-card"><div className="flex items-center justify-between border-b border-border p-5"><div><h3 className="m-0 text-lg font-black text-foreground-heading">Campaign performance</h3><p className="m-0 mt-1 text-sm text-foreground-muted">Published campaigns from your organization</p></div><Link href="/campaigns" className="text-sm font-bold text-primary">View all</Link></div><div className="divide-y divide-border">{published.length === 0 ? <p className="p-5 text-sm text-foreground-muted">No published campaigns yet.</p> : published.map((campaign) => <Link href={`/campaigns/${campaign.id}`} key={campaign.id} className="flex items-center gap-4 p-5 transition hover:bg-surface"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-primary"><Gift size={20}/></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="m-0 truncate font-bold text-foreground-heading">{campaign.title}</p><StatusBadge status="Published"/></div><p className="m-0 mt-1 text-sm text-foreground-muted">{campaign.points.toLocaleString("en-IN")} points · {campaign.locationName}</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, campaign.claims / Math.max(1, campaign.totalClaimsAllowed) * 100)}%` }}/></div></div><div className="text-right"><p className="m-0 font-black text-foreground-heading">{campaign.claims}</p><p className="m-0 text-xs text-foreground-muted">claims</p></div></Link>)}</div></section>
        <section className="rounded-2xl border border-border bg-surface-card"><div className="flex items-center justify-between border-b border-border p-5"><div><h3 className="m-0 text-lg font-black text-foreground-heading">Recent campaigns</h3><p className="m-0 mt-1 text-sm text-foreground-muted">Latest records from the Go API</p></div><Link href="/campaigns" className="text-sm font-bold text-primary">Open campaigns</Link></div><div className="divide-y divide-border">{recent.length === 0 ? <p className="p-5 text-sm text-foreground-muted">No campaigns have been created.</p> : recent.map((campaign) => <Link href={`/campaigns/${campaign.id}`} key={campaign.id} className="flex items-center gap-3 p-5 transition hover:bg-surface"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-primary"><Megaphone size={17}/></div><div className="min-w-0 flex-1"><p className="m-0 truncate text-sm font-bold text-foreground-heading">{campaign.title}</p><p className="m-0 mt-1 text-xs text-foreground-muted">{campaign.locationName} · {campaign.points.toLocaleString("en-IN")} points</p></div><StatusBadge status={campaign.status === "published" ? "Published" : campaign.status === "paused" ? "Paused" : campaign.status === "archived" ? "Archived" : campaign.status === "expired" ? "Expired" : "Draft"}/></Link>)}</div></section>
      </div>
    </div>
  </RewardorShell>;
}

function Metric({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return <div className="rounded-2xl border border-border bg-surface-card p-5"><div className="flex items-center justify-between"><p className="m-0 text-sm font-semibold text-foreground-muted">{label}</p><span className="rounded-xl bg-surface p-2 text-primary">{icon}</span></div><p className="m-0 mt-5 text-3xl font-black text-foreground-heading">{value}</p><p className="m-0 mt-1 text-xs font-semibold text-foreground-muted">{detail}</p></div>;
}
