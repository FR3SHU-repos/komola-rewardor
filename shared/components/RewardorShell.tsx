"use client";

import Link from "next/link";
import { BarChart3, ChevronDown, Gift, LayoutDashboard, LogOut, Megaphone, Settings, ShieldCheck } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getRewardorBootstrap, type RewardorBootstrap } from "@/shared/lib/api";
import { createAuthBrowserClient } from "@/shared/lib/supabase/auth-client";

const nav = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/claims", label: "Claims & redemptions", icon: Gift },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

function initials(value: string): string {
  return value.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "K";
}

export function RewardorShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [workspace, setWorkspace] = useState<RewardorBootstrap | null>(null);

  useEffect(() => {
    let alive = true;
    void getRewardorBootstrap().then((result) => {
      if (alive && result.success && result.data) setWorkspace(result.data);
    });
    return () => { alive = false; };
  }, []);

  const user = workspace?.user;
  const organization = workspace?.organization;
  const organizationName = organization?.displayName || organization?.organization?.displayName || "KOMOLA organization";
  const userName = user?.name || "Signed-in user";
  const role = user?.role || organization?.membership?.roles?.[0] || "Rewardor member";

  async function signOut() {
    await createAuthBrowserClient().auth.signOut();
    window.localStorage.removeItem("komola:rewardor-organization-id");
    window.location.assign("/login?next=/");
  }

  return <div className="min-h-screen lg:flex">
    <aside className="hidden w-72 shrink-0 border-r border-border bg-surface-card lg:flex lg:flex-col">
      <div className="flex h-20 items-center gap-3 border-b border-border px-7"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><Gift size={21}/></div><div><p className="m-0 text-lg font-black tracking-tight text-foreground-heading">KOMOLA</p><p className="m-0 text-xs font-semibold text-foreground-muted">Rewardor workspace</p></div></div>
      <div className="border-b border-border p-5"><button className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface px-3 py-3 text-left" type="button"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary font-bold text-primary">{initials(organizationName)}</div><div className="min-w-0 flex-1"><p className="m-0 truncate text-sm font-bold text-foreground-heading">{organizationName}</p><p className="m-0 text-xs text-foreground-muted">Shared KOMOLA organization</p></div><ChevronDown size={16} className="text-foreground-muted"/></button></div>
      <nav className="flex-1 space-y-1 p-5">{nav.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${path === href || path.startsWith(`${href}/`) ? "bg-primary text-primary-foreground" : "text-foreground-muted hover:bg-surface hover:text-foreground-heading"}`}><Icon size={18}/>{label}</Link>)}<div className="my-5 border-t border-border"/><div className="flex items-center gap-3 px-3 py-3 text-xs font-semibold uppercase tracking-wider text-foreground-muted"><ShieldCheck size={16}/> Protected workspace</div></nav>
      <div className="border-t border-border p-5"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-bold text-primary">{initials(userName)}</div><div className="min-w-0 flex-1"><p className="m-0 truncate text-sm font-bold text-foreground-heading">{userName}</p><p className="m-0 text-xs text-foreground-muted">{role}</p></div><button type="button" onClick={() => void signOut()} aria-label="Sign out" title="Sign out" className="rounded-lg p-2 text-foreground-muted transition hover:bg-surface hover:text-foreground-heading"><LogOut size={16}/></button></div></div>
    </aside>
    <main className="min-w-0 flex-1">{children}</main>
  </div>;
}
