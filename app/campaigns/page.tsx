"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Filter, Plus, Search } from "lucide-react";
import { RewardorShell } from "@/shared/components/RewardorShell";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { listRewardCampaigns, type RewardCampaign } from "@/shared/lib/api";

function statusLabel(status: RewardCampaign["status"]): "Published" | "Draft" | "Paused" | "Expired" | "Archived" {
  return status === "draft" ? "Draft" : status === "published" ? "Published" : status === "paused" ? "Paused" : status === "archived" ? "Archived" : "Expired";
}

export default function Campaigns() {
  const [items, setItems] = useState<RewardCampaign[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    void listRewardCampaigns().then((result) => {
      if (result.success && result.data) setItems(result.data.items);
      else setError(result.message);
    });
  }, []);
  return <RewardorShell>
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-surface-card px-5 py-5 sm:px-8"><div><p className="m-0 text-sm font-semibold text-foreground-muted">Rewardor workspace</p><h1 className="m-0 mt-1 text-2xl font-black text-foreground-heading">Campaigns</h1></div><Link href="/campaigns/new" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground"><Plus size={17}/> New campaign</Link></header>
    <div className="space-y-6 p-5 sm:p-8"><div className="flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-3 text-foreground-muted" size={17}/><input className="w-full rounded-xl border border-border bg-surface-card py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="Search campaigns"/></div><button className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-card px-4 py-2.5 text-sm font-bold text-foreground-heading"><Filter size={16}/> All statuses</button></div>
      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface-card"><div className="hidden grid-cols-[1.5fr_1fr_120px_120px_100px] gap-4 border-b border-border bg-surface p-4 text-xs font-bold uppercase tracking-wider text-foreground-muted md:grid"><span>Campaign</span><span>Audience</span><span>Claims</span><span>Ends</span><span>Status</span></div>{items.map((campaign) => <Link href={`/campaigns/${campaign.id}`} key={campaign.id} className="grid gap-3 border-b border-border p-5 transition last:border-0 hover:bg-surface md:grid-cols-[1.5fr_1fr_120px_120px_100px] md:items-center md:gap-4 md:p-4"><div><p className="m-0 font-bold text-foreground-heading">{campaign.title}</p><p className="m-0 mt-1 text-sm text-foreground-muted">{campaign.points.toLocaleString("en-IN")} Komola points</p></div><p className="m-0 text-sm text-foreground-muted">{campaign.locationName}</p><p className="m-0 text-sm font-bold text-foreground-heading">{campaign.claims} <span className="font-normal text-foreground-muted">/ {campaign.totalClaimsAllowed}</span></p><p className="m-0 text-sm text-foreground-muted">{campaign.endsAt ? new Date(campaign.endsAt).toLocaleDateString("en-IN") : "—"}</p><span><StatusBadge status={statusLabel(campaign.status)}/></span></Link>)}</div>
    </div>
  </RewardorShell>;
}
