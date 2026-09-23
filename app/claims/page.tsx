"use client";

import { Download, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { RewardorShell } from "@/shared/components/RewardorShell";
import { StatusBadge } from "@/shared/components/StatusBadge";
import {
  approveRewardClaim,
  getRewardorClaims,
  rejectRewardClaim,
  type RewardorClaimActivity,
  type RewardorClaimStatus,
  type RewardorClaimsSummary,
} from "@/shared/lib/api";

const emptySummary: RewardorClaimsSummary = {
  totalClaimsAllowed: 0,
  claimed: 0,
  redeemed: 0,
  pendingPoints: 0,
};

function statusLabel(status: RewardorClaimStatus): string {
  return status === "claimed"
    ? "Pending approval"
    : status === "cancelled"
      ? "Rejected / cancelled"
      : status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function fulfillmentLabel(
  method: RewardorClaimActivity["fulfillmentMethod"],
): string {
  return method === "home_delivery"
    ? "Home delivery"
    : method === "store_pickup"
      ? "Store pickup"
      : "Online redemption";
}

function csvCell(value: string | number): string {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export default function ClaimsPage() {
  const [items, setItems] = useState<RewardorClaimActivity[]>([]);
  const [summary, setSummary] = useState<RewardorClaimsSummary>(emptySummary);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | RewardorClaimStatus>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyClaim, setBusyClaim] = useState<string | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    void getRewardorClaims(search, status).then((result) => {
      if (!alive) return;
      if (result.success && result.data) {
        setItems(result.data.items);
        setSummary(result.data.summary);
        setError("");
      } else {
        setError(result.message);
      }
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [search, status, reload]);

  async function decide(
    item: RewardorClaimActivity,
    action: "approve" | "reject",
  ) {
    if (busyClaim) return;
    const promptedReason =
      action === "reject"
        ? window.prompt("Optional reason for rejecting this claim:")
        : "";
    if (promptedReason === null) return;
    const reason = promptedReason ?? "";
    setBusyClaim(item.id);
    const result =
      action === "approve"
        ? await approveRewardClaim(item.id)
        : await rejectRewardClaim(item.id, reason);
    setBusyClaim(null);
    if (!result.success) setError(result.message);
    else setReload((value) => value + 1);
  }

  function exportClaims() {
    const header = [
      "Claim code",
      "Campaign",
      "Buyer",
      "Status",
      "Points",
      "Claimed at",
      "Redeemed at",
    ];
    const rows = items.map((item) => [
      item.claimCode,
      item.campaign,
      item.buyer,
      item.status,
      item.points,
      item.claimedAt,
      item.redeemedAt ?? "",
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((value) => csvCell(value)).join(","))
      .join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "komola-rewardor-claims.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <RewardorShell>
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-surface-card px-5 py-5 sm:px-8">
        <div>
          <p className="m-0 text-sm font-semibold text-foreground-muted">
            Campaign activity
          </p>
          <h1 className="m-0 mt-1 text-2xl font-black text-foreground-heading">
            Claims & redemptions
          </h1>
        </div>
        <button
          type="button"
          onClick={exportClaims}
          disabled={!items.length}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-card px-4 py-2.5 text-sm font-bold text-foreground-heading disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download size={16} /> Export
        </button>
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
            label="Total claims allowed"
            value={
              loading ? "—" : summary.totalClaimsAllowed.toLocaleString("en-IN")
            }
          />
          <Metric
            label="Redeemed"
            value={loading ? "—" : summary.redeemed.toLocaleString("en-IN")}
          />
          <Metric
            label="Pending Komola points"
            value={
              loading ? "—" : summary.pendingPoints.toLocaleString("en-IN")
            }
          />
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-surface-card">
          <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
            <Search size={17} className="text-foreground-muted" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="min-w-48 flex-1 bg-transparent text-sm outline-none"
              placeholder="Search claim code, campaign, or buyer"
              aria-label="Search claims"
            />
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as "" | RewardorClaimStatus)
              }
              className="rounded-lg border border-border bg-surface-card px-3 py-2 text-sm font-semibold text-foreground-heading"
              aria-label="Filter claim status"
            >
              <option value="">All statuses</option>
              <option value="claimed">Pending approval</option>
              <option value="approved">Approved</option>
              <option value="redeemed">Redeemed</option>
              <option value="cancelled">Rejected / cancelled</option>
            </select>
          </div>
          <div className="hidden grid-cols-[130px_1.5fr_1fr_140px_150px] gap-4 border-b border-border bg-surface p-4 text-xs font-bold uppercase tracking-wider text-foreground-muted md:grid">
            <span>Code</span>
            <span>Campaign</span>
            <span>Buyer</span>
            <span>Status</span>
            <span>Date</span>
          </div>
          {loading ? (
            <p className="p-6 text-sm font-semibold text-foreground-muted">
              Loading claims…
            </p>
          ) : items.length === 0 ? (
            <p className="p-6 text-sm font-semibold text-foreground-muted">
              No real claims match this workspace and filter.
            </p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="border-b border-border p-5 last:border-0"
              >
                <div className="grid gap-2 md:grid-cols-[130px_1.5fr_1fr_140px_150px] md:items-center md:gap-4 md:p-0">
                  <span className="font-mono text-sm font-bold text-primary">
                    {item.claimCode}
                  </span>
                  <span className="text-sm font-bold text-foreground-heading">
                    {item.campaign}
                  </span>
                  <span className="text-sm text-foreground-muted">
                    {item.buyer}
                    <br />
                    <span className="text-xs">{item.buyerPhone}</span>
                  </span>
                  <span>
                    <StatusBadge status={statusLabel(item.status)} />
                  </span>
                  <span className="text-sm text-foreground-muted">
                    {formatDate(item.claimedAt)}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 rounded-xl bg-surface p-4 text-sm md:grid-cols-[1fr_1fr_auto] md:items-start">
                  <div>
                    <p className="font-bold text-foreground-heading">
                      {fulfillmentLabel(item.fulfillmentMethod)}
                    </p>
                    {item.fulfillmentMethod === "home_delivery" ? (
                      <p className="mt-1 text-foreground-muted">
                        {formatAddress(item.deliveryAddress)}
                      </p>
                    ) : item.fulfillmentMethod === "store_pickup" ? (
                      <p className="mt-1 text-foreground-muted">
                        {item.pickupStoreName}
                        <br />
                        {item.pickupStorePhone}
                        <br />
                        {formatAddress(item.pickupStoreAddress)}
                      </p>
                    ) : (
                      <p className="mt-1 text-foreground-muted">
                        Use the online redemption instructions from the
                        campaign.
                      </p>
                    )}
                  </div>
                  <p className="m-0 text-foreground-muted">
                    <span className="font-bold text-foreground-heading">
                      {item.points.toLocaleString("en-IN")} Komola points
                    </span>
                    <br />
                    {item.status === "claimed"
                      ? "Points are locked until approval."
                      : item.status === "approved"
                        ? "Points transferred to the Rewardor account."
                        : "Reward redeemed."}
                  </p>
                  {item.status === "claimed" ? (
                    <div className="flex gap-2 md:justify-end">
                      <button
                        type="button"
                        disabled={busyClaim === item.id}
                        onClick={() => void decide(item, "reject")}
                        className="rounded-lg border border-border px-3 py-2 text-xs font-bold text-foreground-heading disabled:opacity-50"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        disabled={busyClaim === item.id}
                        onClick={() => void decide(item, "approve")}
                        className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground disabled:opacity-50"
                      >
                        {busyClaim === item.id ? "Saving…" : "Approve"}
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </RewardorShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-card p-5">
      <p className="m-0 text-sm font-semibold text-foreground-muted">{label}</p>
      <p className="m-0 mt-2 text-3xl font-black text-foreground-heading">
        {value}
      </p>
    </div>
  );
}

function formatAddress(address?: Record<string, string>): string {
  if (!address) return "No address provided";
  return (
    [
      address.line1,
      address.line2,
      address.city,
      address.state,
      address.postalCode,
    ]
      .filter(Boolean)
      .join(", ") || "No address provided"
  );
}
