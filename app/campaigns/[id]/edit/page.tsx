"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CampaignForm } from "@/shared/components/CampaignForm";
import { RewardorShell } from "@/shared/components/RewardorShell";
import { getRewardCampaign, type RewardCampaign } from "@/shared/lib/api";

export default function EditCampaign({ params }: { params: Promise<{ id: string }> }) {
  const [campaign, setCampaign] = useState<RewardCampaign | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { void params.then(({ id }) => getRewardCampaign(id).then((result) => result.success && result.data ? setCampaign(result.data) : setError(result.message))); }, [params]);
  return <RewardorShell><header className="border-b border-border bg-surface-card px-5 py-5 sm:px-8"><Link href={campaign ? `/campaigns/${campaign.id}` : "/campaigns"} className="text-sm font-bold text-foreground-muted">← Back to campaign</Link><h1 className="m-0 mt-4 text-2xl font-black text-foreground-heading">Edit campaign</h1><p className="m-0 mt-1 text-sm text-foreground-muted">Changes are allowed while the campaign is draft or paused.</p></header>{error ? <p role="alert" className="m-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 sm:m-8">{error}</p> : campaign ? <CampaignForm campaign={campaign}/> : <p className="p-8 text-sm text-foreground-muted">Loading campaign…</p>}</RewardorShell>;
}
