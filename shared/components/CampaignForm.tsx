"use client";

import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ApprovalMode, FulfillmentMethod, PlatformLocation, RewardCampaign, RewardCampaignInput } from "@/shared/lib/api";
import { createRewardCampaign, getPlatformLocations, getRewardorBootstrap, updateRewardCampaign } from "@/shared/lib/api";
import { uploadRewardCampaignImage } from "@/shared/lib/supabase/reward-campaign-images";
import { CampaignFormSections } from "@/shared/components/rewardor/CampaignFormSections";
import { useObjectUrlPreview } from "@/shared/hooks/useObjectUrlPreview";

function normalizeIndianMobile(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) digits = digits.slice(2);
  return /^[6-9]\d{9}$/.test(digits) ? `+91${digits}` : "";
}

export function CampaignForm({ campaign }: { campaign?: RewardCampaign }) {
  const router = useRouter();
  const { preview: imagePreview, setFilePreview } = useObjectUrlPreview(campaign?.imageUrl || null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [locations, setLocations] = useState<PlatformLocation[]>([]);
  const [locationCode, setLocationCode] = useState(campaign?.locationCode ?? "");
  const [pickupCity, setPickupCity] = useState(campaign?.pickupStoreAddress?.city ?? "");
  const [pickupStorePhone, setPickupStorePhone] = useState(campaign?.pickupStorePhone ?? "");
  const [deliveryMethod, setDeliveryMethod] = useState<FulfillmentMethod>(campaign?.deliveryOptions?.[0] ?? "home_delivery");
  const [approvalMode, setApprovalMode] = useState<ApprovalMode>(campaign?.approvalMode ?? "manual");
  const editing = Boolean(campaign);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function loadFormOptions() {
      try {
        const [locationsResult, bootstrapResult] = await Promise.all([
          getPlatformLocations({ signal: controller.signal }),
          getRewardorBootstrap({ signal: controller.signal }),
        ]);
        if (!active || controller.signal.aborted) return;
        if (locationsResult.success && locationsResult.data) {
          const enabledLocations = locationsResult.data.items.filter(
            (location) => location.enabled !== false && location.status !== "disabled",
          );
          setLocations(enabledLocations);
          setLocationCode((current) => enabledLocations.some((location) => location.code === current) ? current : enabledLocations[0]?.code || "");
          setPickupCity((current) => enabledLocations.some((location) => location.name === current) ? current : enabledLocations[0]?.name || "");
        } else {
          setError(locationsResult.message || "Available cities could not be loaded.");
        }
        const rewardorPhone = bootstrapResult.data?.organization?.organization?.phoneE164;
        if (rewardorPhone) setPickupStorePhone((current) => current || rewardorPhone);
      } catch (loadError) {
        if (!active || controller.signal.aborted) return;
        setError(loadError instanceof Error ? loadError.message : "Campaign form options could not be loaded.");
      }
    }

    void loadFormOptions();
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !/^image\/(jpeg|png|webp)$/.test(file.type)) {
      setError("Upload a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Choose an image smaller than 5 MB.");
      return;
    }
    setImageFile(file);
    setError("");
    setFilePreview(file);
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    const points = Number(String(data.get("points") ?? "").replace(/,/g, ""));
    const totalClaimsAllowed = Number(data.get("totalClaimsAllowed") ?? 0);
    const perBuyerLimit = Number(data.get("perBuyerLimit") ?? 0);
    const pickupStorePhone = normalizeIndianMobile(String(data.get("pickupStorePhone") ?? "").trim());
    const body: RewardCampaignInput = {
      title: String(data.get("title") ?? "").trim(),
      description: String(data.get("description") ?? "").trim(),
      campaignType: String(data.get("campaignType") ?? "product") as RewardCampaignInput["campaignType"],
      rewardType: String(data.get("rewardType") ?? "fixed_points") as RewardCampaignInput["rewardType"],
      points,
      totalClaimsAllowed,
      perBuyerLimit,
      timerEnabled: data.get("timerEnabled") === "on",
      locationCode: String(data.get("locationCode") ?? locationCode),
      startsAt: data.get("startsAt") ? `${data.get("startsAt")}T00:00:00Z` : null,
      endsAt: data.get("endsAt") ? `${data.get("endsAt")}T23:59:59Z` : null,
      imageUrl: campaign?.imageUrl ?? "",
      approvalMode,
      deliveryOptions: [deliveryMethod],
      pickupStoreName: String(data.get("pickupStoreName") ?? "").trim(),
      pickupStorePhone,
      pickupStoreAddress: {
        line1: String(data.get("pickupAddressLine1") ?? "").trim(),
        line2: String(data.get("pickupAddressLine2") ?? "").trim(),
        city: String(data.get("pickupAddressCity") ?? pickupCity).trim(),
        state: String(data.get("pickupAddressState") ?? "").trim(),
        postalCode: String(data.get("pickupAddressPostalCode") ?? "").trim(),
        country: "India",
      },
    };
    if (!body.locationCode) {
      setError("Select an enabled KOMOLA city.");
      return;
    }
    if (!body.title || !body.description || !Number.isInteger(points) || points <= 0 || !Number.isInteger(totalClaimsAllowed) || totalClaimsAllowed <= 0 || !Number.isInteger(perBuyerLimit) || perBuyerLimit <= 0) {
      setError("Enter campaign details and valid claim limits.");
      return;
    }
    if (deliveryMethod === "store_pickup" && (!body.pickupStoreName || !/^\+91[6-9]\d{9}$/.test(body.pickupStorePhone ?? "") || !body.pickupStoreAddress.line1 || !body.pickupStoreAddress.city || !body.pickupStoreAddress.state || !/^\d{6}$/.test(body.pickupStoreAddress.postalCode))) {
      setError("Enter the pickup store name, phone, and complete Indian address.");
      return;
    }
    setSaving(true);
    if (imageFile) {
      try {
        body.imageUrl = await uploadRewardCampaignImage(imageFile);
      } catch (uploadError) {
        setSaving(false);
        setError(uploadError instanceof Error ? uploadError.message : "Campaign image upload failed.");
        return;
      }
    }
    const result = campaign ? await updateRewardCampaign(campaign.id, body) : await createRewardCampaign(body);
    if (!result.success || !result.data) {
      setSaving(false);
      setError(result.message);
      return;
    }
    router.push(`/campaigns/${result.data.id}`);
  }

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-6 p-5 sm:p-8">
      <CampaignFormSections
        campaign={campaign}
        approvalMode={approvalMode}
        setApprovalMode={setApprovalMode}
        deliveryMethod={deliveryMethod}
        setDeliveryMethod={setDeliveryMethod}
        imagePreview={imagePreview}
        handleImageChange={handleImageChange}
        locations={locations}
        locationCode={locationCode}
        setLocationCode={setLocationCode}
        pickupCity={pickupCity}
        setPickupCity={setPickupCity}
        pickupStorePhone={pickupStorePhone}
        setPickupStorePhone={setPickupStorePhone}
      />
      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
      <div className="flex flex-wrap justify-end gap-3">
        <Link href={campaign ? `/campaigns/${campaign.id}` : "/campaigns"} className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-card px-5 py-3 text-sm font-bold text-foreground-heading"><ArrowLeft size={16} /> Cancel</Link>
        <button type="submit" disabled={saving || locations.length === 0} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"><Check size={17} /> {saving ? "Saving…" : editing ? "Save changes" : "Create campaign"}</button>
      </div>
    </form>
  );
}
