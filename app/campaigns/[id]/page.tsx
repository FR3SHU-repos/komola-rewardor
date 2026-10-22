"use client";

import Link from "next/link";
import { type ChangeEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  Archive,
  Pause,
  Pencil,
  Play,
} from "lucide-react";
import { RewardorShell } from "@/shared/components/RewardorShell";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { CampaignDetailSections } from "@/shared/components/rewardor/CampaignDetailSections";
import {
  getRewardCampaign,
  transitionRewardCampaign,
  updateRewardCampaignImage,
  type RewardCampaign,
} from "@/shared/lib/api";
import { uploadRewardCampaignImage } from "@/shared/lib/supabase/reward-campaign-images";
import { useObjectUrlPreview } from "@/shared/hooks/useObjectUrlPreview";

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
  const { preview: imagePreview, setFilePreview, setRemotePreview } =
    useObjectUrlPreview();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBusy, setImageBusy] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setCampaign(null);
    setRemotePreview(null);
    setError("");

    async function loadCampaign() {
      try {
        const { id } = await params;
        if (!active) return;
        const result = await getRewardCampaign(id, { signal: controller.signal });
        if (!active || controller.signal.aborted) return;
        if (result.success && result.data) {
          setCampaign(result.data);
          setRemotePreview(result.data.imageUrl || null);
        } else setError(result.message);
      } catch (loadError) {
        if (!active || controller.signal.aborted) return;
        setError(loadError instanceof Error ? loadError.message : "Campaign could not be loaded.");
      }
    }

    void loadCampaign();
    return () => {
      active = false;
      controller.abort();
    };
  }, [params, setRemotePreview]);

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
    setFilePreview(file);
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
      setRemotePreview(result.data.imageUrl || imageUrl);
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
        <CampaignDetailSections
          campaign={campaign}
          status={status}
          imagePreview={imagePreview}
          imageFile={imageFile}
          imageBusy={imageBusy}
          chooseImage={chooseImage}
          saveImage={() => void saveImage()}
        />
      </div>
    </RewardorShell>
  );
}
