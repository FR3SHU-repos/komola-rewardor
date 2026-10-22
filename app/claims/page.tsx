"use client";

import { ChevronLeft, ChevronRight, Download, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { RewardorShell } from "@/shared/components/RewardorShell";
import { ClaimActivityCard } from "@/shared/components/rewardor/ClaimActivityCard";
import {
  approveRewardClaim,
  deliverRewardClaim,
  getRewardorClaims,
  rejectRewardClaim,
  type RewardorClaimActivity,
  type RewardorClaimStatus,
  type RewardorClaimsMeta,
  type RewardorClaimsSummary,
} from "@/shared/lib/api";

const CLAIMS_PAGE_SIZE = 10;

const emptySummary: RewardorClaimsSummary = {
  totalClaimsAllowed: 0,
  claimed: 0,
  redeemed: 0,
  pendingPoints: 0,
};

const emptyMeta: RewardorClaimsMeta = {
  page: 1,
  limit: CLAIMS_PAGE_SIZE,
  total: 0,
  totalPages: 1,
};

function csvCell(value: string | number): string {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export default function ClaimsPage() {
  const [items, setItems] = useState<RewardorClaimActivity[]>([]);
  const [summary, setSummary] = useState<RewardorClaimsSummary>(emptySummary);
  const [meta, setMeta] = useState<RewardorClaimsMeta>(emptyMeta);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | RewardorClaimStatus>("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyClaim, setBusyClaim] = useState<string | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    async function loadClaims() {
      try {
        const result = await getRewardorClaims(search, status, page, {
          signal: controller.signal,
        });
        if (!active || controller.signal.aborted) return;
        if (result.success && result.data) {
          const nextMeta = result.data.meta ?? emptyMeta;
          setItems(result.data.items);
          setSummary(result.data.summary);
          setMeta(nextMeta);
          setError("");
          if (page > nextMeta.totalPages) {
            setPage(nextMeta.totalPages);
            return;
          }
        } else {
          setError(result.message);
        }
      } catch (loadError) {
        if (!active || controller.signal.aborted) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Claims could not be loaded.",
        );
      } finally {
        if (active && !controller.signal.aborted) setLoading(false);
      }
    }

    void loadClaims();
    return () => {
      active = false;
      controller.abort();
    };
  }, [search, status, page, reload]);

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

  async function markDelivered(item: RewardorClaimActivity) {
    if (busyClaim || item.status !== "approved") return;
    if (!window.confirm("Confirm that this reward has been delivered to the buyer?")) return;
    setBusyClaim(item.id);
    const result = await deliverRewardClaim(item.id);
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
      "Delivered at",
      "Confirmed at",
      "Redeemed at",
    ];
    const rows = items.map((item) => [
      item.claimCode,
      item.campaign,
      item.buyer,
      item.status,
      item.points,
      item.claimedAt,
      item.deliveredAt ?? "",
      item.confirmedAt ?? "",
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
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className="min-w-48 flex-1 bg-transparent text-sm outline-none"
              placeholder="Search claim code, campaign, or buyer"
              aria-label="Search claims"
            />
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as "" | RewardorClaimStatus);
                setPage(1);
              }}
              className="rounded-lg border border-border bg-surface-card px-3 py-2 text-sm font-semibold text-foreground-heading"
              aria-label="Filter claim status"
            >
              <option value="">All statuses</option>
              <option value="claimed">Pending approval</option>
              <option value="approved">Approved</option>
              <option value="delivered">Reward delivered</option>
              <option value="confirmed">Buyer confirmed</option>
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
              <ClaimActivityCard
                key={item.id}
                item={item}
                busy={busyClaim === item.id}
                onDecide={(claim, action) => void decide(claim, action)}
                onDeliver={(claim) => void markDelivered(claim)}
              />
            ))
          )}
          {meta.total > 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4 text-sm text-foreground-muted">
              <p className="m-0">
                Showing {(meta.page - 1) * meta.limit + 1}–
                {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  disabled={loading || meta.page <= 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 font-bold text-foreground-heading disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <span className="min-w-24 text-center font-semibold">
                  Page {meta.page} of {meta.totalPages}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPage((value) => Math.min(meta.totalPages, value + 1))
                  }
                  disabled={loading || meta.page >= meta.totalPages}
                  className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 font-bold text-foreground-heading disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ) : null}
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
