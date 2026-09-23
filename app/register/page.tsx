"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { Eye, EyeOff, Gift, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createAuthBrowserClient } from "@/shared/lib/supabase/auth-client";
import { registerRewardorOrganization, reconcileRewardorIdentity, type RewardorOrganizationRegistration } from "@/shared/lib/api";

type RegistrationForm = {
  fullName: string;
  email: string;
  password: string;
  confirm: string;
  displayName: string;
  legalName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
};

const DRAFT_KEY = "komola:rewardor-registration-draft";
const emptyForm: RegistrationForm = { fullName: "", email: "", password: "", confirm: "", displayName: "", legalName: "", phone: "", line1: "", line2: "", city: "Visakhapatnam", state: "Andhra Pradesh", postalCode: "" };
const newIdempotencyKey = () => typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

function normalizeIndianMobile(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  return /^[6-9]\d{9}$/.test(digits) ? `+91${digits}` : null;
}

function draftForStorage(form: RegistrationForm) {
  const { password: _password, confirm: _confirm, ...draft } = form;
  return draft;
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<RegistrationForm>(emptyForm);
  const [sessionReady, setSessionReady] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      const draft = sessionStorage.getItem(DRAFT_KEY);
      if (draft) setForm((current) => ({ ...current, ...JSON.parse(draft) }));
    } catch {
      sessionStorage.removeItem(DRAFT_KEY);
    }
    void createAuthBrowserClient().auth.getSession().then(({ data }) => setSessionReady(Boolean(data.session)));
  }, []);

  function update(key: keyof RegistrationForm, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function createOrganization() {
    const phoneE164 = normalizeIndianMobile(form.phone);
    if (!phoneE164) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return false;
    }
    const address = { line1: form.line1.trim(), line2: form.line2.trim(), city: form.city.trim(), state: form.state.trim(), postalCode: form.postalCode.trim(), country: "India" as const };
    const body: RewardorOrganizationRegistration = {
      organization: { legalName: form.legalName.trim() || form.displayName.trim(), displayName: form.displayName.trim(), contactName: form.fullName.trim(), type: "Rewardor", phoneE164, billingAddress: address },
      location: { code: "visakhapatnam", name: "Visakhapatnam", timezone: "Asia/Kolkata", phoneE164, address },
    };
    const reconciled = await reconcileRewardorIdentity();
    if (!reconciled.success) {
      setError(reconciled.message || "Unable to verify your KOMOLA account.");
      return false;
    }
    const result = await registerRewardorOrganization(body, newIdempotencyKey());
    if (!result.success || !result.data) {
      setError(result.message || "Organization registration could not be completed.");
      return false;
    }
    const organizationId = result.data.organization?.id;
    if (organizationId) window.localStorage.setItem("komola:rewardor-organization-id", organizationId);
    sessionStorage.removeItem(DRAFT_KEY);
    window.location.assign("/");
    return true;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError("");
    if (form.fullName.trim().length < 2) return setError("Enter your full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return setError("Enter a valid email address.");
    if (form.displayName.trim().length < 2) return setError("Enter your organization name.");
    if (!normalizeIndianMobile(form.phone)) return setError("Enter a valid 10-digit Indian mobile number.");
    if (!form.line1.trim() || !form.city.trim() || !form.state.trim() || !/^\d{6}$/.test(form.postalCode.trim())) return setError("Enter the complete Visakhapatnam business address and 6-digit PIN code.");
    setBusy(true);
    try {
      const client = createAuthBrowserClient();
      const { data: sessionData, error: sessionError } = await client.auth.getSession();
      if (sessionError) throw sessionError;
      if (!sessionData.session) {
        if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
        if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draftForStorage(form)));
        const { data, error: authError } = await client.auth.signUp({ email: form.email.trim().toLowerCase(), password: form.password, options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/register`, data: { display_name: form.fullName.trim(), account_type: "rewardor" } } });
        if (authError) {
          setError(/already registered|already exists/i.test(authError.message) ? "This email is already registered. Sign in instead." : "Registration could not be completed. Please try again.");
          return;
        }
        if (!data.session) {
          router.replace("/auth/check-email");
          return;
        }
      }
      await createOrganization();
    } catch {
      setError("We could not complete registration. Check that the Go API is running and try again.");
    } finally {
      setBusy(false);
    }
  }

  const field = (key: keyof RegistrationForm, label: string, options: { type?: string; inputMode?: "numeric" | "tel"; autoComplete?: string; placeholder?: string; maxLength?: number } = {}) => {
    const required = !["legalName", "line2"].includes(key);
    return <label className="block text-sm font-semibold text-foreground-heading">{label}{required ? <span className="ml-1 text-status-danger" aria-hidden="true">*</span> : null}<input className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground-heading outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" type={options.type ?? "text"} inputMode={options.inputMode} autoComplete={options.autoComplete} placeholder={options.placeholder} maxLength={options.maxLength} value={form[key]} onChange={(event) => update(key, event.target.value)} required={required} /></label>;
  };

  return <main className="flex min-h-screen justify-center bg-surface px-4 py-8"><form noValidate onSubmit={submit} className="w-full max-w-2xl space-y-5 rounded-2xl border border-border bg-surface-card p-6 shadow-sm sm:p-8">
    <div className="flex flex-col items-center text-center"><span className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground"><Gift className="h-6 w-6" /></span><p className="mt-3 text-lg font-black tracking-tight text-foreground-heading">KOMOLA</p><h1 className="mt-1 text-xl font-black text-foreground-heading">Create your Rewardor account</h1><p className="mt-1 text-sm text-foreground-muted">Create your account and organization without leaving Rewardor.</p></div>
    <div className="rounded-xl bg-surface px-4 py-3 text-sm text-foreground-muted"><span className="font-semibold text-foreground-heading">Rewardor organization:</span> these details create your shared KOMOLA organization and its Visakhapatnam location through the Go API.</div>
    <fieldset className="space-y-4"><legend className="text-lg font-black text-foreground-heading">Account details</legend>{field("fullName", "Full name", { autoComplete: "name" })}{field("email", "Email", { type: "email", autoComplete: "email" })}{!sessionReady ? <><PasswordInput label="Password" value={form.password} show={false} onChange={(value) => update("password", value)} onToggle={() => {}} autoComplete="new-password" hideToggle />{field("confirm", "Confirm password", { type: "password", autoComplete: "new-password" })}</> : <p className="rounded-lg bg-status-success-surface px-3 py-2 text-xs font-semibold text-status-success">You are signed in. Complete the organization details below.</p>}</fieldset>
    <fieldset className="space-y-4"><legend className="text-lg font-black text-foreground-heading">Organization details</legend>{field("displayName", "Organization name", { autoComplete: "organization", placeholder: "Name buyers will see" })}{field("legalName", "Legal name (optional)", { autoComplete: "organization" })}{field("phone", "Support phone", { inputMode: "tel", autoComplete: "tel-national", placeholder: "98765 43210", maxLength: 10 })}<p className="-mt-2 text-xs font-semibold text-status-danger"><span aria-hidden="true">*</span> This 10-digit Indian phone number must be unique across KOMOLA accounts.</p></fieldset>
    <fieldset className="space-y-4"><legend className="text-lg font-black text-foreground-heading">Visakhapatnam location</legend>{field("line1", "Address line 1", { autoComplete: "address-line1", placeholder: "Building, street or area" })}{field("line2", "Address line 2 (optional)", { autoComplete: "address-line2", placeholder: "Landmark or locality" })}<div className="grid gap-4 sm:grid-cols-2">{field("city", "City", { autoComplete: "address-level2" })}{field("state", "State", { autoComplete: "address-level1" })}</div>{field("postalCode", "PIN code", { inputMode: "numeric", autoComplete: "postal-code", placeholder: "6-digit PIN code", maxLength: 6 })}</fieldset>
    {error ? <p role="alert" aria-live="polite" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
    <button type="submit" disabled={busy} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary-hover disabled:opacity-60">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{busy ? "Creating organization…" : "Create Rewardor account"}</button>
    <p className="text-center text-sm text-foreground-muted">Already registered? <Link href="/login" className="font-semibold text-primary hover:underline">Sign in</Link></p>
  </form></main>;
}

function PasswordInput({ label, value, show, onChange, onToggle, autoComplete, hideToggle = false }: { label: string; value: string; show: boolean; onChange: (value: string) => void; onToggle: () => void; autoComplete: string; hideToggle?: boolean }) {
  return <label className="block text-sm font-semibold text-foreground-heading">{label}<span className="ml-1 text-status-danger" aria-hidden="true">*</span><div className="relative mt-1.5"><input className={`w-full rounded-xl border border-border bg-surface px-4 py-2.5 ${hideToggle ? "" : "pr-11"} text-sm text-foreground-heading outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10`} type={show ? "text" : "password"} autoComplete={autoComplete} value={value} onChange={(event) => onChange(event.target.value)} required />{!hideToggle ? <button type="button" onClick={onToggle} aria-label={show ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`} className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-foreground-muted hover:text-foreground-heading">{show ? <EyeOff size={17} /> : <Eye size={17} />}</button> : null}</div></label>;
}
