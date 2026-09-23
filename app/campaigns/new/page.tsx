import Link from "next/link";
import { CampaignForm } from "@/shared/components/CampaignForm";
import { RewardorShell } from "@/shared/components/RewardorShell";

export default function NewCampaign() {
  return <RewardorShell><header className="border-b border-border bg-surface-card px-5 py-5 sm:px-8"><Link href="/campaigns" className="text-sm font-bold text-foreground-muted">← Back to campaigns</Link><h1 className="m-0 mt-4 text-2xl font-black text-foreground-heading">Create a reward campaign</h1><p className="m-0 mt-1 text-sm text-foreground-muted">Give buyers a clear reason to choose your products.</p></header><CampaignForm /></RewardorShell>;
}
