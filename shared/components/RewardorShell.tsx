"use client";

import Link from "next/link";
import {
  BarChart3,
  ChevronDown,
  Gift,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Settings,
  ShieldCheck,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getRewardorBootstrap, type RewardorBootstrap } from "@/shared/lib/api";
import { createAuthBrowserClient } from "@/shared/lib/supabase/auth-client";

const nav = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/claims", label: "Claims & redemptions", icon: Gift },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/support", label: "Support", icon: HelpCircle },
];

function initials(value: string): string {
  return (
    value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "K"
  );
}

function isActivePath(path: string, href: string): boolean {
  return path === href || (href !== "/" && path.startsWith(`${href}/`));
}

export function RewardorShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [workspace, setWorkspace] = useState<RewardorBootstrap | null>(null);
  const [workspaceError, setWorkspaceError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileDrawerRef = useRef<HTMLElement>(null);
  const lastFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    getRewardorBootstrap({ signal: controller.signal })
      .then((result) => {
        if (!active || controller.signal.aborted) return;
        if (result.success && result.data) {
          setWorkspace(result.data);
          setWorkspaceError("");
        } else {
          setWorkspaceError(result.message || "Workspace access could not be verified.");
        }
      })
      .catch((error: unknown) => {
        if (!active || controller.signal.aborted) return;
        setWorkspaceError(error instanceof Error ? error.message : "Workspace access could not be verified.");
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    lastFocusedElement.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const drawer = mobileDrawerRef.current;
    const getFocusable = () => Array.from(drawer?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []);
    getFocusable()[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
      if (event.key !== "Tab") return;
      const focusable = getFocusable();
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      lastFocusedElement.current?.focus();
    };
  }, [mobileMenuOpen]);

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

  function renderNavigation(className: string) {
    return (
      <nav className={className} aria-label="Rewardor workspace">
        <div className="rewardor-nav-label">Workspace</div>
        {nav.map(({ href, label, icon: Icon }) => {
          const active = isActivePath(path, href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileMenuOpen(false)}
              aria-current={active ? "page" : undefined}
              className={`rewardor-nav-link ${active ? "active" : ""}`}
            >
              <Icon size={17} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          );
        })}
        <div className="rewardor-nav-divider" />
        <div className="rewardor-protected-label">
          <ShieldCheck size={16} aria-hidden="true" />
          <span>Protected workspace</span>
        </div>
      </nav>
    );
  }

  return (
    <div className="rewardor-shell">
      <a className="rewardor-skip-link" href="#main-content">Skip to content</a>
      <aside className="rewardor-sidebar">
        <div className="rewardor-brand">
          <div className="rewardor-brand-mark" aria-hidden="true"><Gift size={21} /></div>
          <div><p className="rewardor-brand-name">KOMOLA</p><p className="rewardor-brand-subtitle">Rewardor workspace</p></div>
        </div>
        <div className="rewardor-organization" aria-label="Current organization">
          <div className="rewardor-organization-avatar" aria-hidden="true">{initials(organizationName)}</div>
          <div className="rewardor-organization-copy"><p>{organizationName}</p><span>Shared KOMOLA organization</span></div>
          <ChevronDown size={16} aria-hidden="true" />
        </div>
        {renderNavigation("rewardor-sidebar-nav")}
        <div className="rewardor-account">
          <div className="rewardor-account-avatar" aria-hidden="true">{initials(userName)}</div>
          <div className="rewardor-account-copy"><p>{userName}</p><span>{role}</span></div>
          <button type="button" onClick={() => void signOut()} aria-label="Sign out" title="Sign out" className="rewardor-icon-button"><LogOut size={16} aria-hidden="true" /></button>
        </div>
      </aside>

      {mobileMenuOpen ? <button className="rewardor-mobile-backdrop" type="button" aria-label="Close navigation" onClick={() => setMobileMenuOpen(false)} /> : null}
      <aside ref={mobileDrawerRef} className={`rewardor-mobile-drawer ${mobileMenuOpen ? "open" : ""}`} role="dialog" aria-modal="true" aria-label="Mobile navigation" aria-hidden={!mobileMenuOpen}>
        <div className="rewardor-mobile-drawer-head">
          <div><p className="rewardor-nav-label">KOMOLA / Rewardor</p><strong>Workspace navigation</strong></div>
          <button type="button" className="rewardor-icon-button" onClick={() => setMobileMenuOpen(false)} aria-label="Close navigation"><X size={18} aria-hidden="true" /></button>
        </div>
        {renderNavigation("rewardor-mobile-nav")}
      </aside>

      <main id="main-content" className="rewardor-main">
        <header className="rewardor-topbar">
          <div className="rewardor-topbar-heading">
            <div><p className="rewardor-topbar-kicker">KOMOLA / Rewardor</p><p className="rewardor-topbar-title">Campaign operations</p></div>
            <button type="button" className="rewardor-icon-button rewardor-mobile-menu-toggle" onClick={() => setMobileMenuOpen(true)} aria-label="Open navigation" aria-expanded={mobileMenuOpen}><Menu size={18} aria-hidden="true" /></button>
          </div>
          <div className="rewardor-topbar-user">
            <span className="rewardor-topbar-avatar" aria-hidden="true">{initials(userName)}</span>
            <span className="rewardor-topbar-user-copy"><strong>{userName}</strong><small>{role}</small></span>
            <button type="button" className="rewardor-icon-button" onClick={() => void signOut()} aria-label="Sign out" title="Sign out"><LogOut size={15} aria-hidden="true" /></button>
          </div>
        </header>
        {workspaceError ? <div className="rewardor-shell-notice" role="alert"><ShieldCheck size={16} aria-hidden="true" /><span>{workspaceError}</span></div> : null}
        {children}
      </main>
    </div>
  );
}
