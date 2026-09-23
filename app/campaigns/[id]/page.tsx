"use client";

import Link from "next/link";
import { type ChangeEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  Archive,
  BarChart3,
  Check,
  Gift,
  ImagePlus,
  Pause,
  Pencil,
  Play,
  Upload,
  Users,
} from "lucide-react";
import { RewardorShell } from "@/shared/components/RewardorShell";
import { StatusBadge } from "@/shared/components/StatusBadge";
import {
  getRewardCampaign,
  transitionRewardCampaign,
  updateRewardCampaignImage,
  type RewardCampaign,
} from "@/shared/lib/api";
import { uploadRewardCampaignImage } from "@/shared/lib/supabase/reward-campaign-images";

function label(status: RewardCampaign["status"]) {
  return status === "published"
    ? "Published"
    : status === "paused"
      ? "Paused"
      : status === "expired"
        ? "Expired"
        : status === "archived"
          ? "Archived"
          : "Draft";
}

export default function CampaignDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [campaign, setCampaign] = useState<RewardCampaign | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBusy, setImageBusy] = useState(false);
  useEffect(() => {
    void params.then(({ id }) =>
      getRewardCampaign(id).then((result) => {
        if (result.success && result.data) {
          setCampaign(result.data);
          setImagePreview(result.data.imageUrl || null);
        } else setError(result.message);
      }),
    );
  }, [params]);

  function chooseImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !/^image\/(jpeg|png|webp)$/.test(file.type)) {
      setError("Upload a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Campaign images must be 5 MB or smaller.");
      return;
    }
    setError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function saveImage() {
    if (!campaign || !imageFile || imageBusy || campaign.status === "archived")
      return;
    setImageBusy(true);
    setError("");
    try {
      const imageUrl = await uploadRewardCampaignImage(imageFile);
      const result = await updateRewardCampaignImage(campaign.id, imageUrl);
      if (!result.success || !result.data) {
        setError(result.message);
        return;
      }
      setCampaign(result.data);
      setImageFile(null);
      setImagePreview(result.data.imageUrl || imageUrl);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Campaign image upload failed.",
      );
    } finally {
      setImageBusy(false);
    }
  }

  async function transition(action: "publish" | "pause" | "archive") {
    if (!campaign || busy) return;
    if (
      action === "archive" &&
      !window.confirm(
        "Archive this campaign? It will no longer be available for publishing.",
      )
    )
      return;
    setBusy(true);
    setError("");
    const result = await transitionRewardCampaign(campaign.id, action);
    setBusy(false);
    if (!result.success || !result.data) {
      setError(result.message);
      return;
    }
    setCampaign(result.data);
  }

  if (error && !campaign)
    return (
      <RewardorShell>
        <p
          role="alert"
          className="m-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 sm:m-8"
        >
          {error}
        </p>
      </RewardorShell>
    );
  if (!campaign)
    return (
      <RewardorShell>
        <p className="p-8 text-sm text-foreground-muted">Loading campaign…</p>
      </RewardorShell>
    );

  const status = label(campaign.status);
  const canEdit = campaign.status === "draft" || campaign.status === "paused";
  const canPublish =
    campaign.status === "draft" || campaign.status === "paused";
  const canPause = campaign.status === "published";
  const canArchive =
    campaign.status === "draft" ||
    campaign.status === "paused" ||
    campaign.status === "expired";
  return (
    <RewardorShell>
      <header className="border-b border-border bg-surface-card px-5 py-5 sm:px-8">
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-2 text-sm font-bold text-foreground-muted"
        >
          <ArrowLeft size={16} /> Back to campaigns
        </Link>
        <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="m-0 text-2xl font-black text-foreground-heading">
                {campaign.title}
              </h1>
              <StatusBadge status={status} />
            </div>
            <p className="m-0 mt-2 text-sm text-foreground-muted">
              {campaign.points.toLocaleString("en-IN")} Komola points ·{" "}
              {campaign.locationName} ·{" "}
              {campaign.endsAt
                ? `Ends ${new Date(campaign.endsAt).toLocaleDateString("en-IN")}`
                : "No end date"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {canEdit ? (
              <Link
                href={`/campaigns/${campaign.id}/edit`}
                className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-foreground-heading"
              >
                <Pencil size={16} /> Edit
              </Link>
            ) : null}
            {canPublish ? (
              <button
                disabled={busy}
                onClick={() => void transition("publish")}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
              >
                <Play size={16} /> Publish
              </button>
            ) : null}
            {canPause ? (
              <button
                disabled={busy}
                onClick={() => void transition("pause")}
                className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-foreground-heading disabled:opacity-60"
              >
                <Pause size={16} /> Pause
              </button>
            ) : null}
            {canArchive ? (
              <button
                disabled={busy}
                onClick={() => void transition("archive")}
                className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-foreground-heading disabled:opacity-60"
              >
                <Archive size={16} /> Archive
              </button>
            ) : null}
          </div>
        </div>
      </header>
      <div className="space-y-6 p-5 sm:p-8">
        {error ? (
          <p
            role="alert"
            className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
          >
            {error}
          </p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-3">
          <Metric
            icon={<Users size={18} />}
            label="Claims"
            value={String(campaign.claims)}
          />
          <Metric
            icon={<Gift size={18} />}
            label="Claims remaining"
            value={String(
              Math.max(0, campaign.totalClaimsAllowed - campaign.claims),
            )}
          />
          <Metric
            icon={<BarChart3 size={18} />}
            label="Points allocation"
            value={(
              campaign.points * campaign.totalClaimsAllowed
            ).toLocaleString("en-IN")}
          />
        </div>
        <section className="rounded-2xl border border-border bg-surface-card p-6">
          <div className="flex items-start gap-3">
            <ImagePlus className="mt-1 text-primary" size={20} />
            <div>
              <h2 className="m-0 text-lg font-black text-foreground-heading">
                Campaign image
              </h2>
              <p className="m-0 mt-1 text-sm text-foreground-muted">
                Review the artwork buyers will see.
              </p>
            </div>
          </div>
          <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-surface">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt={`${campaign.title} campaign artwork`}
                className="max-h-96 w-full object-contain"
              />
            ) : (
              <div className="flex min-h-48 flex-col items-center justify-center gap-3 p-6 text-center text-sm text-foreground-muted">
                <ImagePlus size={32} className="text-primary" />
                No image uploaded yet.
              </div>
            )}
          </div>
          {campaign.status !== "archived" ? (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-foreground-heading">
                <Upload size={16} />
                {imagePreview ? "Choose a different image" : "Upload image"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={chooseImage}
                />
              </label>
              {imageFile ? (
                <button
                  type="button"
                  disabled={imageBusy}
                  onClick={() => void saveImage()}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
                >
                  <Check size={16} />
                  {imageBusy ? "Uploading…" : "Save image"}
                </button>
              ) : null}
              <span className="text-xs font-semibold text-foreground-muted">
                JPG, PNG, or WebP · maximum 5 MB
              </span>
            </div>
          ) : null}
        </section>
        <section className="rounded-2xl border border-border bg-surface-card p-6">
          <h2 className="m-0 text-lg font-black text-foreground-heading">
            Campaign details
          </h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground-muted">
            {campaign.description}
          </p>
          <dl className="mt-6 grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
            <Info label="Campaign type" value={campaign.campaignType} />
            <Info label="Reward type" value={campaign.rewardType} />
            <Info
              label="Claim approval"
              value={campaign.approvalMode === "automatic" ? "Automatic approval" : "Manual approval"}
            />
            <Info
              label="Limit per buyer"
              value={String(campaign.perBuyerLimit)}
            />
            <Info
              label="Timer"
              value={campaign.timerEnabled ? "Shown to buyers" : "Hidden"}
            />
          </dl>
        </section>
        <section className="rounded-2xl border border-border bg-surface-card p-6">
          <h2 className="m-0 text-lg font-black text-foreground-heading">
            Campaign readiness
          </h2>
          <div className="mt-5 space-y-4">
            {[
              ["Campaign details", "Complete"],
              ["Location eligibility", campaign.locationName],
              [
                "Claim limits",
                `${campaign.totalClaimsAllowed.toLocaleString("en-IN")} allowed`,
              ],
              ["Current state", status],
            ].map(([item, value]) => (
              <div
                className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                key={item}
              >
                <span className="text-sm font-semibold text-foreground-heading">
                  {item}
                </span>
                <span className="text-sm font-bold text-status-success">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </RewardorShell>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface-card p-5">
      <div className="flex items-center justify-between">
        <p className="m-0 text-sm font-semibold text-foreground-muted">
          {label}
        </p>
        <span className="text-primary">{icon}</span>
      </div>
      <p className="m-0 mt-3 text-3xl font-black text-foreground-heading">
        {value}
      </p>
    </div>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-foreground-muted">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold text-foreground-heading">
        {value}
      </dd>
    </div>
  );
}
