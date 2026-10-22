"use client";

import { type ChangeEvent } from "react";
import { BarChart3, Check, Gift, ImagePlus, Upload, Users } from "lucide-react";
import type { RewardCampaign } from "@/shared/lib/api";

type CampaignDetailSectionsProps = {
  campaign: RewardCampaign;
  status: string;
  imagePreview: string | null;
  imageFile: File | null;
  imageBusy: boolean;
  chooseImage: (event: ChangeEvent<HTMLInputElement>) => void;
  saveImage: () => void;
};

export function CampaignDetailSections({
  campaign,
  status,
  imagePreview,
  imageFile,
  imageBusy,
  chooseImage,
  saveImage,
}: CampaignDetailSectionsProps) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric icon={<Users size={18} />} label="Claims" value={String(campaign.claims)} />
        <Metric icon={<Gift size={18} />} label="Claims remaining" value={String(Math.max(0, campaign.totalClaimsAllowed - campaign.claims))} />
        <Metric icon={<BarChart3 size={18} />} label="Points allocation" value={(campaign.points * campaign.totalClaimsAllowed).toLocaleString("en-IN")} />
      </div>
      <section className="rounded-2xl border border-border bg-surface-card p-6">
        <div className="flex items-start gap-3">
          <ImagePlus className="mt-1 text-primary" size={20} />
          <div>
            <h2 className="m-0 text-lg font-black text-foreground-heading">Campaign image</h2>
            <p className="m-0 mt-1 text-sm text-foreground-muted">Review the artwork buyers will see.</p>
          </div>
        </div>
        <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-surface">
          {imagePreview ? <img src={imagePreview} alt={`${campaign.title} campaign artwork`} className="max-h-96 w-full object-contain" /> : <div className="flex min-h-48 flex-col items-center justify-center gap-3 p-6 text-center text-sm text-foreground-muted"><ImagePlus size={32} className="text-primary" />No image uploaded yet.</div>}
        </div>
        {campaign.status !== "archived" ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-foreground-heading"><Upload size={16} />{imagePreview ? "Choose a different image" : "Upload image"}<input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={chooseImage} /></label>
            {imageFile ? <button type="button" disabled={imageBusy} onClick={saveImage} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60"><Check size={16} />{imageBusy ? "Uploading…" : "Save image"}</button> : null}
            <span className="text-xs font-semibold text-foreground-muted">JPG, PNG, or WebP · maximum 5 MB</span>
          </div>
        ) : null}
      </section>
      <section className="rounded-2xl border border-border bg-surface-card p-6">
        <h2 className="m-0 text-lg font-black text-foreground-heading">Campaign details</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground-muted">{campaign.description}</p>
        <dl className="mt-6 grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
          <Info label="Campaign type" value={campaign.campaignType} />
          <Info label="Reward type" value={campaign.rewardType} />
          <Info label="Claim approval" value={campaign.approvalMode === "automatic" ? "Automatic approval" : "Manual approval"} />
          <Info label="Limit per buyer" value={String(campaign.perBuyerLimit)} />
          <Info label="Timer" value={campaign.timerEnabled ? "Shown to buyers" : "Hidden"} />
        </dl>
      </section>
      <section className="rounded-2xl border border-border bg-surface-card p-6">
        <h2 className="m-0 text-lg font-black text-foreground-heading">Campaign readiness</h2>
        <div className="mt-5 space-y-4">
          {[["Campaign details", "Complete"], ["Location eligibility", campaign.locationName], ["Claim limits", `${campaign.totalClaimsAllowed.toLocaleString("en-IN")} allowed`], ["Current state", status]].map(([item, value]) => <div className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0" key={item}><span className="text-sm font-semibold text-foreground-heading">{item}</span><span className="text-sm font-bold text-status-success">{value}</span></div>)}
        </div>
      </section>
    </>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-2xl border border-border bg-surface-card p-5"><div className="flex items-center justify-between"><p className="m-0 text-sm font-semibold text-foreground-muted">{label}</p><span className="text-primary">{icon}</span></div><p className="m-0 mt-3 text-3xl font-black text-foreground-heading">{value}</p></div>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-bold uppercase tracking-wide text-foreground-muted">{label}</dt><dd className="mt-1 text-sm font-semibold text-foreground-heading">{value}</dd></div>;
}
