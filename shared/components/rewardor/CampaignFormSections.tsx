"use client";

import { type ChangeEvent } from "react";
import { ChevronDown, Gift, ImagePlus, MapPin, ShieldCheck, Timer, Upload } from "lucide-react";
import type { ApprovalMode, FulfillmentMethod, PlatformLocation, RewardCampaign } from "@/shared/lib/api";

const input =
  "mt-2 w-full rounded-xl border border-border bg-surface-card px-4 py-3 text-sm text-foreground-heading outline-none focus:ring-2 focus:ring-primary/20";

type CampaignFormSectionsProps = {
  campaign?: RewardCampaign;
  approvalMode: ApprovalMode;
  setApprovalMode: (mode: ApprovalMode) => void;
  deliveryMethod: FulfillmentMethod;
  setDeliveryMethod: (method: FulfillmentMethod) => void;
  imagePreview: string | null;
  handleImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
  locations: PlatformLocation[];
  locationCode: string;
  setLocationCode: (code: string) => void;
  pickupCity: string;
  setPickupCity: (city: string) => void;
  pickupStorePhone: string;
  setPickupStorePhone: (phone: string) => void;
};

export function CampaignFormSections({
  campaign,
  approvalMode,
  setApprovalMode,
  deliveryMethod,
  setDeliveryMethod,
  imagePreview,
  handleImageChange,
  locations,
  locationCode,
  setLocationCode,
  pickupCity,
  setPickupCity,
  pickupStorePhone,
  setPickupStorePhone,
}: CampaignFormSectionsProps) {
  return (
    <>
      <section className="rounded-2xl border border-border bg-surface-card p-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-1 text-primary" size={20} />
          <div>
            <h2 className="m-0 text-lg font-black text-foreground-heading">Claim approval</h2>
            <p className="m-0 mt-1 text-sm text-foreground-muted">Choose whether claims are accepted immediately or reviewed by your team.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface p-4">
            <input type="radio" name="approvalMode" value="automatic" checked={approvalMode === "automatic"} onChange={() => setApprovalMode("automatic")} className="mt-1 h-4 w-4 accent-primary" />
            <span><span className="block text-sm font-bold text-foreground-heading">Automatic approval</span><span className="mt-1 block text-xs text-foreground-muted">Approve claims immediately and transfer the locked points to your Rewardor account.</span></span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface p-4">
            <input type="radio" name="approvalMode" value="manual" checked={approvalMode === "manual"} onChange={() => setApprovalMode("manual")} className="mt-1 h-4 w-4 accent-primary" />
            <span><span className="block text-sm font-bold text-foreground-heading">Manual approval</span><span className="mt-1 block text-xs text-foreground-muted">Keep points locked until a Rewardor team member approves the claim.</span></span>
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface-card p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary"><Gift size={19} /></div>
          <div>
            <h2 className="m-0 text-lg font-black text-foreground-heading">Campaign details</h2>
            <p className="m-0 text-sm text-foreground-muted">Start with the message buyers will see.</p>
          </div>
        </div>
        <label className="block text-sm font-bold text-foreground-heading">
          Campaign name
          <input name="title" className={input} defaultValue={campaign?.title ?? ""} placeholder="e.g. Fresh harvest welcome" required />
        </label>
        <label className="mt-5 block text-sm font-bold text-foreground-heading">
          Buyer-facing description
          <textarea name="description" className={`${input} min-h-28 resize-y`} defaultValue={campaign?.description ?? ""} placeholder="Tell buyers how many Komola points they can earn." required />
        </label>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-bold text-foreground-heading">
            Campaign type
            <div className="relative">
              <select name="campaignType" className={input} defaultValue={campaign?.campaignType ?? "product"}>
                <option value="product">Product reward</option>
                <option value="offer">Offer — free tickets or experiences</option>
                <option value="online_cashback">Online cashback</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-5 text-foreground-muted" size={16} />
            </div>
          </label>
          <label className="block text-sm font-bold text-foreground-heading">
            Reward type
            <div className="relative">
              <select name="rewardType" className={input} defaultValue={campaign?.rewardType ?? "fixed_points"}>
                <option value="fixed_points">Fixed Komola points</option>
                <option value="bonus_points">Bonus Komola points</option>
                <option value="points_multiplier">Points multiplier</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-5 text-foreground-muted" size={16} />
            </div>
          </label>
          <label className="block text-sm font-bold text-foreground-heading">
            Komola points
            <input name="points" className={input} inputMode="numeric" defaultValue={campaign?.points ?? ""} placeholder="1500" required />
          </label>
        </div>
        <p className="mt-4 text-xs font-semibold text-foreground-muted">Campaign type describes the context. Buyer benefits are always Komola points; tickets, products, or online offers remain campaign terms.</p>
      </section>

      <section className="rounded-2xl border border-border bg-surface-card p-6">
        <div className="flex items-start gap-3">
          <ImagePlus className="mt-1 text-primary" size={20} />
          <div>
            <h2 className="m-0 text-lg font-black text-foreground-heading">Product or offer picture</h2>
            <p className="m-0 mt-1 text-sm text-foreground-muted">Upload campaign artwork for buyers.</p>
          </div>
        </div>
        <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-surface px-6 py-8 text-center transition hover:border-primary/50 hover:bg-secondary/30">
          {imagePreview ? <img src={imagePreview} alt="Selected reward product" className="mb-4 h-40 w-full max-w-sm rounded-xl object-cover" /> : <Upload className="mb-3 text-primary" size={28} />}
          <span className="text-sm font-bold text-foreground-heading">{imagePreview ? "Choose a different picture" : "Upload product picture"}</span>
          <span className="mt-1 text-xs text-foreground-muted">PNG, JPG, or WEBP · maximum 5 MB</span>
          <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={handleImageChange} />
        </label>
        <p className="mt-3 text-xs font-semibold text-foreground-muted">The image uploads to Supabase Storage when you save the campaign. Existing campaign URLs are preserved during edits.</p>
      </section>

      <section className="rounded-2xl border border-border bg-surface-card p-6">
        <div className="flex items-start gap-3">
          <MapPin className="mt-1 text-primary" size={20} />
          <div>
            <h2 className="m-0 text-lg font-black text-foreground-heading">Location eligibility</h2>
            <p className="m-0 mt-1 text-sm text-foreground-muted">Only buyers from the selected location can see and claim this offer.</p>
          </div>
        </div>
        <label className="mt-5 block text-sm font-bold text-foreground-heading">
          Eligible location
          <div className="relative">
            <select name="locationCode" className={input} value={locationCode} onChange={(event) => setLocationCode(event.target.value)} disabled={locations.length === 0} required>
              {locations.length === 0 ? <option value="">Loading available cities…</option> : locations.map((location) => <option key={location.id} value={location.code}>{location.name}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-5 text-foreground-muted" size={16} />
          </div>
        </label>
      </section>

      <section className="rounded-2xl border border-border bg-surface-card p-6">
        <div className="flex items-start gap-3">
          <Timer className="mt-1 text-primary" size={20} />
          <div>
            <h2 className="m-0 text-lg font-black text-foreground-heading">Offer timer</h2>
            <p className="m-0 mt-1 text-sm text-foreground-muted">Show a countdown timer for this specific reward offer.</p>
          </div>
        </div>
        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface p-4">
          <input name="timerEnabled" type="checkbox" className="mt-1 h-4 w-4 accent-primary" defaultChecked={campaign?.timerEnabled ?? true} />
          <span><span className="block text-sm font-bold text-foreground-heading">Show timer on offer</span><span className="mt-1 block text-xs leading-5 text-foreground-muted">When enabled, buyers see the remaining time until the campaign ends.</span></span>
        </label>
      </section>

      <section className="rounded-2xl border border-border bg-surface-card p-6">
        <h2 className="m-0 text-lg font-black text-foreground-heading">Fulfilment method</h2>
        <p className="m-0 mt-1 text-sm text-foreground-muted">Choose one method for this campaign. Buyers will not choose the method themselves.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface p-4"><input type="radio" name="deliveryMethod" value="home_delivery" checked={deliveryMethod === "home_delivery"} onChange={() => setDeliveryMethod("home_delivery")} className="mt-1 h-4 w-4 accent-primary" /><span><span className="block text-sm font-bold text-foreground-heading">Home delivery</span><span className="mt-1 block text-xs text-foreground-muted">The buyer must provide a complete Indian delivery address.</span></span></label>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface p-4"><input type="radio" name="deliveryMethod" value="store_pickup" checked={deliveryMethod === "store_pickup"} onChange={() => setDeliveryMethod("store_pickup")} className="mt-1 h-4 w-4 accent-primary" /><span><span className="block text-sm font-bold text-foreground-heading">Collect in store</span><span className="mt-1 block text-xs text-foreground-muted">The buyer collects from the store details below.</span></span></label>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface p-4"><input type="radio" name="deliveryMethod" value="online_redemption" checked={deliveryMethod === "online_redemption"} onChange={() => setDeliveryMethod("online_redemption")} className="mt-1 h-4 w-4 accent-primary" /><span><span className="block text-sm font-bold text-foreground-heading">Online redemption</span><span className="mt-1 block text-xs text-foreground-muted">The buyer redeems online using the campaign instructions.</span></span></label>
        </div>
        {deliveryMethod === "store_pickup" ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-bold text-foreground-heading">Store name<input name="pickupStoreName" className={input} defaultValue={campaign?.pickupStoreName ?? ""} required /></label>
            <label className="block text-sm font-bold text-foreground-heading">Store phone<input name="pickupStorePhone" className={input} value={pickupStorePhone} onChange={(event) => setPickupStorePhone(event.target.value)} inputMode="tel" required /><span className="mt-1 block text-xs font-semibold text-foreground-muted">Use the Rewardor phone or a new number not already used in KOMOLA.</span></label>
            <label className="block text-sm font-bold text-foreground-heading sm:col-span-2">Address line 1<input name="pickupAddressLine1" className={input} defaultValue={campaign?.pickupStoreAddress?.line1 ?? ""} required /></label>
            <label className="block text-sm font-bold text-foreground-heading">Address line 2<input name="pickupAddressLine2" className={input} defaultValue={campaign?.pickupStoreAddress?.line2 ?? ""} /></label>
            <label className="block text-sm font-bold text-foreground-heading">City<div className="relative"><select name="pickupAddressCity" className={input} value={pickupCity} onChange={(event) => setPickupCity(event.target.value)} disabled={locations.length === 0} required>{locations.length === 0 ? <option value="">Loading available cities…</option> : locations.map((location) => <option key={location.id} value={location.name}>{location.name}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-5 text-foreground-muted" size={16} /></div></label>
            <label className="block text-sm font-bold text-foreground-heading">State<input name="pickupAddressState" className={input} defaultValue={campaign?.pickupStoreAddress?.state ?? ""} required /></label>
            <label className="block text-sm font-bold text-foreground-heading">PIN code<input name="pickupAddressPostalCode" className={input} defaultValue={campaign?.pickupStoreAddress?.postalCode ?? ""} inputMode="numeric" required /></label>
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-border bg-surface-card p-6">
        <h2 className="m-0 text-lg font-black text-foreground-heading">Limits and validity</h2>
        <p className="m-0 mt-1 text-sm text-foreground-muted">Keep your reward predictable and fair.</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-bold text-foreground-heading">Total claims allowed<input name="totalClaimsAllowed" className={input} inputMode="numeric" defaultValue={campaign?.totalClaimsAllowed ?? ""} placeholder="500" required /></label>
          <label className="block text-sm font-bold text-foreground-heading">Limit per buyer<input name="perBuyerLimit" className={input} inputMode="numeric" defaultValue={campaign?.perBuyerLimit ?? 1} /></label>
          <label className="block text-sm font-bold text-foreground-heading">Starts on<input name="startsAt" className={input} type="date" defaultValue={dateValue(campaign?.startsAt)} /></label>
          <label className="block text-sm font-bold text-foreground-heading">Ends on<input name="endsAt" className={input} type="date" defaultValue={dateValue(campaign?.endsAt)} /></label>
        </div>
      </section>
    </>
  );
}

function dateValue(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}
