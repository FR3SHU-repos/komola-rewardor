"use client";

import { BarChart3, Gift, Users, WalletCards } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { RewardorShell } from "@/shared/components/RewardorShell";
import { getRewardorAnalytics, type RewardorAnalytics } from "@/shared/lib/api";

function formatDelta(value: number | null, days: number): string {
  if (value === null) return `No prior ${days}-day data`;
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}% vs previous ${days} days`;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(`${value}T00:00:00`));
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState<RewardorAnalytics | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    void getRewardorAnalytics(30).then((result) => {
      if (!alive) return;
      if (result.success && result.data) {
        setAnalytics(result.data);
        setError("");
      } else {
        setError(result.message);
      }
      setLoading(false);
    });
    return () => { alive = false; };
  }, []);

  const maxClaims = useMemo(() => Math.max(1, ...(analytics?.series.map((point) => point.claims) ?? [0])), [analytics]);
  const firstDate = analytics?.series[0]?.date;
  const middleDate = analytics?.series[Math.floor((analytics.series.length - 1) / 2)]?.date;
  const lastDate = analytics?.series[analytics.series.length - 1]?.date;
  const days = analytics?.periodDays ?? 30;

  return <RewardorShell>
    <header className="border-b border-border bg-surface-card px-5 py-5 sm:px-8"><p className="m-0 text-sm font-semibold text-foreground-muted">Measure what moves buyers</p><h1 className="m-0 mt-1 text-2xl font-black text-foreground-heading">Analytics</h1></header>
    <div className="space-y-6 p-5 sm:p-8">
      {error ? <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={<Users size={18}/>} label="Claims" value={loading ? "—" : (analytics?.claims ?? 0).toLocaleString("en-IN")} detail={loading ? "Loading real data" : formatDelta(analytics?.claimsChangePercent ?? null, days)} />
        <Metric icon={<Gift size={18}/>} label="Redemptions" value={loading ? "—" : (analytics?.redemptions ?? 0).toLocaleString("en-IN")} detail={loading ? "Loading real data" : formatDelta(analytics?.redemptionsChangePercent ?? null, days)} />
        <Metric icon={<BarChart3 size={18}/>} label="Conversion rate" value={loading ? "—" : `${(analytics?.conversionRate ?? 0).toFixed(1)}%`} detail={loading ? "Loading real data" : formatDelta(analytics?.conversionChangePercent ?? null, days)} />
        <Metric icon={<WalletCards size={18}/>} label="Komola points issued" value={loading ? "—" : (analytics?.pointsIssued ?? 0).toLocaleString("en-IN")} detail={loading ? "Loading real data" : formatDelta(analytics?.pointsIssuedChangePercent ?? null, days)} />
      </section>
      <section className="rounded-2xl border border-border bg-surface-card p-6"><div className="flex items-center justify-between"><div><h2 className="m-0 text-lg font-black text-foreground-heading">Claims over time</h2><p className="m-0 mt-1 text-sm text-foreground-muted">Last {days} days from real campaign claims</p></div></div>
        {loading ? <p className="mt-8 text-sm font-semibold text-foreground-muted">Loading analytics…</p> : analytics?.claims === 0 ? <p className="mt-8 text-sm font-semibold text-foreground-muted">No claims recorded in this period.</p> : <><div className="mt-8 flex h-56 items-end gap-1 border-b border-l border-border px-2 sm:gap-2 sm:px-4">{analytics?.series.map((point) => <div key={point.date} title={`${formatDate(point.date)}: ${point.claims} claims`} className="flex-1 rounded-t-md bg-primary/80 transition hover:bg-primary" style={{ height: `${Math.max(4, point.claims / maxClaims * 100)}%` }}/>)}</div><div className="mt-3 flex justify-between text-xs text-foreground-muted"><span>{firstDate ? formatDate(firstDate) : ""}</span><span>{middleDate ? formatDate(middleDate) : ""}</span><span>{lastDate ? formatDate(lastDate) : ""}</span></div></>}
      </section>
    </div>
  </RewardorShell>;
}

function Metric({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return <div className="rounded-2xl border border-border bg-surface-card p-5"><div className="flex items-center justify-between"><p className="m-0 text-sm font-semibold text-foreground-muted">{label}</p><span className="rounded-xl bg-surface p-2 text-primary">{icon}</span></div><p className="m-0 mt-5 text-3xl font-black text-foreground-heading">{value}</p><p className={`m-0 mt-1 text-xs font-bold ${detail.startsWith("+") ? "text-status-success" : "text-foreground-muted"}`}>{detail}</p></div>;
}
