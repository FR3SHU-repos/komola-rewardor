"use client";

import type { RewardorClaimActivity, RewardorClaimStatus } from "@/shared/lib/api";
import { StatusBadge } from "@/shared/components/StatusBadge";

type ClaimActivityCardProps = {
  item: RewardorClaimActivity;
  busy: boolean;
  onDecide: (item: RewardorClaimActivity, action: "approve" | "reject") => void;
  onDeliver: (item: RewardorClaimActivity) => void;
};

export function ClaimActivityCard({ item, busy, onDecide, onDeliver }: ClaimActivityCardProps) {
  return (
    <div className="border-b border-border p-5 last:border-0">
      <div className="grid gap-2 md:grid-cols-[130px_1.5fr_1fr_140px_150px] md:items-center md:gap-4 md:p-0">
        <span className="font-mono text-sm font-bold text-primary">{item.claimCode}</span>
        <span className="text-sm font-bold text-foreground-heading">{item.campaign}</span>
        <span className="text-sm text-foreground-muted">{item.buyer}<br /><span className="text-xs">{item.buyerPhone}</span></span>
        <span><StatusBadge status={statusLabel(item.status)} /></span>
        <span className="text-sm text-foreground-muted">{formatDate(item.claimedAt)}</span>
      </div>
      <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
        <p className="font-bold text-foreground-heading">Verify buyer before processing</p>
        <p className="mt-1 text-foreground-muted">Match the claim code <span className="font-mono font-bold text-primary">{item.claimCode}</span> with the buyer’s mobile number <span className="font-bold text-foreground-heading">{item.buyerPhone || "Not available"}</span>.</p>
      </div>
      <div className="mt-4 grid gap-3 rounded-xl bg-surface p-4 text-sm md:grid-cols-[1fr_1fr_auto] md:items-start">
        <div>
          <p className="font-bold text-foreground-heading">{fulfillmentLabel(item.fulfillmentMethod)}</p>
          {item.fulfillmentMethod === "home_delivery" ? <p className="mt-1 text-foreground-muted">{formatAddress(item.deliveryAddress)}</p> : item.fulfillmentMethod === "store_pickup" ? <p className="mt-1 text-foreground-muted">{item.pickupStoreName}<br />{item.pickupStorePhone}<br />{formatAddress(item.pickupStoreAddress)}</p> : <p className="mt-1 text-foreground-muted">Use the online redemption instructions from the campaign.</p>}
        </div>
        <p className="m-0 text-foreground-muted"><span className="font-bold text-foreground-heading">{item.points.toLocaleString("en-IN")} Komola points</span><br />{item.status === "claimed" ? "Points are locked until approval." : item.status === "approved" ? "Points transferred. Deliver the reward, then mark it delivered." : item.status === "delivered" ? "Reward delivered. Waiting for the buyer to confirm receipt." : item.status === "confirmed" ? "Buyer confirmed receipt of the reward." : "Reward redeemed."}</p>
        {item.status === "claimed" ? <div className="flex gap-2 md:justify-end"><button type="button" disabled={busy} onClick={() => onDecide(item, "reject")} className="rounded-lg border border-border px-3 py-2 text-xs font-bold text-foreground-heading disabled:opacity-50">Reject</button><button type="button" disabled={busy} onClick={() => onDecide(item, "approve")} className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground disabled:opacity-50">{busy ? "Saving…" : "Approve"}</button></div> : item.status === "approved" ? <button type="button" disabled={busy} onClick={() => onDeliver(item)} className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground disabled:opacity-50">{busy ? "Saving…" : "Mark reward delivered"}</button> : item.status === "delivered" ? <span className="text-right text-xs font-semibold text-foreground-muted">Waiting for buyer confirmation</span> : null}
      </div>
    </div>
  );
}

function statusLabel(status: RewardorClaimStatus): string {
  return status === "claimed" ? "Pending approval" : status === "cancelled" ? "Rejected / cancelled" : status === "delivered" ? "Reward delivered" : status === "confirmed" ? "Buyer confirmed" : status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function fulfillmentLabel(method: RewardorClaimActivity["fulfillmentMethod"]): string {
  return method === "home_delivery" ? "Home delivery" : method === "store_pickup" ? "Store pickup" : "Online redemption";
}

function formatAddress(address?: Record<string, string>): string {
  if (!address) return "No address provided";
  return [address.line1, address.line2, address.city, address.state, address.postalCode].filter(Boolean).join(", ") || "No address provided";
}
