"use client";
import { type ChangeEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ChevronDown, Gift, ImagePlus, MapPin, Timer, Upload } from "lucide-react";
import { RewardorShell } from "@/shared/components/RewardorShell";

const input = "mt-2 w-full rounded-xl border border-border bg-surface-card px-4 py-3 text-sm text-foreground-heading outline-none focus:ring-2 focus:ring-primary/20";

export default function NewCampaign() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    setImagePreview(URL.createObjectURL(file));
  };
  return <RewardorShell>
    <header className="border-b border-border bg-surface-card px-5 py-5 sm:px-8">
      <Link href="/campaigns" className="inline-flex items-center gap-2 text-sm font-bold text-foreground-muted"><ArrowLeft size={16}/> Back to campaigns</Link>
      <h1 className="m-0 mt-4 text-2xl font-black text-foreground-heading">Create a reward campaign</h1>
      <p className="m-0 mt-1 text-sm text-foreground-muted">Give buyers a clear reason to choose your products.</p>
    </header>
    <div className="max-w-3xl space-y-6 p-5 sm:p-8">
      <section className="rounded-2xl border border-border bg-surface-card p-6">
        <div className="mb-6 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary"><Gift size={19}/></div><div><h2 className="m-0 text-lg font-black text-foreground-heading">Campaign details</h2><p className="m-0 text-sm text-foreground-muted">Start with the message buyers will see.</p></div></div>
        <label className="block text-sm font-bold text-foreground-heading">Campaign name<input className={input} placeholder="e.g. Fresh harvest welcome"/></label>
        <label className="mt-5 block text-sm font-bold text-foreground-heading">Buyer-facing description<textarea className={`${input} min-h-28 resize-y`} placeholder="Tell buyers how many Komola points they can earn."/></label>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-bold text-foreground-heading">Campaign type<div className="relative"><select className={input} defaultValue="product"><option value="product">Product reward</option><option value="offer">Offer — free tickets or experiences</option><option value="online_cashback">Online cashback</option></select><ChevronDown className="pointer-events-none absolute right-3 top-5 text-foreground-muted" size={16}/></div></label>
          <label className="block text-sm font-bold text-foreground-heading">Reward type<div className="relative"><select className={input}><option>Fixed Komola points</option><option>Bonus Komola points</option><option>Points multiplier</option></select><ChevronDown className="pointer-events-none absolute right-3 top-5 text-foreground-muted" size={16}/></div></label>
          <label className="block text-sm font-bold text-foreground-heading">Komola points<input className={input} inputMode="numeric" placeholder="1,500 points"/></label>
        </div>
        <p className="mt-4 text-xs font-semibold text-foreground-muted">Campaign type describes what the reward is connected to. The buyer benefit is always issued as Komola points; external tickets, products, or online cashback are represented by the campaign terms and redemption flow.</p>
      </section>

      <section className="rounded-2xl border border-border bg-surface-card p-6">
        <div className="flex items-start gap-3"><ImagePlus className="mt-1 text-primary" size={20}/><div><h2 className="m-0 text-lg font-black text-foreground-heading">Product or offer picture</h2><p className="m-0 mt-1 text-sm text-foreground-muted">Upload a picture buyers will see with this reward offer.</p></div></div>
        <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-surface px-6 py-8 text-center transition hover:border-primary/50 hover:bg-secondary/30">
          {imagePreview ? <img src={imagePreview} alt="Selected reward product" className="mb-4 h-40 w-full max-w-sm rounded-xl object-cover"/> : <Upload className="mb-3 text-primary" size={28}/>}<span className="text-sm font-bold text-foreground-heading">{imagePreview ? "Choose a different picture" : "Upload product picture"}</span><span className="mt-1 text-xs text-foreground-muted">PNG, JPG, or WEBP · maximum 5 MB</span><input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={handleImageChange}/>
        </label>
        <p className="mt-3 text-xs font-semibold text-foreground-muted">The selected image will be stored with the campaign and can be replaced before publishing.</p>
      </section>

      <section className="rounded-2xl border border-border bg-surface-card p-6">
        <div className="flex items-start gap-3"><MapPin className="mt-1 text-primary" size={20}/><div><h2 className="m-0 text-lg font-black text-foreground-heading">Location eligibility</h2><p className="m-0 mt-1 text-sm text-foreground-muted">Only buyers from the selected location can see and claim this offer.</p></div></div>
        <label className="mt-5 block text-sm font-bold text-foreground-heading">Eligible location<div className="relative"><select className={input} defaultValue="visakhapatnam"><option value="visakhapatnam">Visakhapatnam</option></select><ChevronDown className="pointer-events-none absolute right-3 top-5 text-foreground-muted" size={16}/></div></label>
        <p className="mt-3 rounded-xl bg-surface px-4 py-3 text-xs font-semibold leading-5 text-foreground-muted">Eligibility is checked on the backend using the buyer&apos;s verified location and the campaign location scope. Selecting a location does not allow buyers from other locations to claim the offer.</p>
      </section>

      <section className="rounded-2xl border border-border bg-surface-card p-6">
        <div className="flex items-start gap-3"><Timer className="mt-1 text-primary" size={20}/><div><h2 className="m-0 text-lg font-black text-foreground-heading">Offer timer</h2><p className="m-0 mt-1 text-sm text-foreground-muted">Show a countdown timer for this specific reward offer.</p></div></div>
        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface p-4"><input type="checkbox" className="mt-1 h-4 w-4 accent-primary" defaultChecked/><span><span className="block text-sm font-bold text-foreground-heading">Show timer on offer</span><span className="mt-1 block text-xs leading-5 text-foreground-muted">When enabled, buyers see the remaining time until the campaign ends. When disabled, the offer remains date-bound but no countdown is displayed.</span></span></label>
      </section>

      <section className="rounded-2xl border border-border bg-surface-card p-6"><h2 className="m-0 text-lg font-black text-foreground-heading">Limits and validity</h2><p className="m-0 mt-1 text-sm text-foreground-muted">Keep your reward predictable and fair.</p><div className="mt-5 grid gap-5 sm:grid-cols-2"><label className="block text-sm font-bold text-foreground-heading">Total claims allowed<input className={input} placeholder="500"/></label><label className="block text-sm font-bold text-foreground-heading">Limit per buyer<input className={input} placeholder="1"/></label><label className="block text-sm font-bold text-foreground-heading">Starts on<input className={input} type="date"/></label><label className="block text-sm font-bold text-foreground-heading">Ends on<input className={input} type="date"/></label></div></section>
      <div className="flex flex-wrap justify-end gap-3"><Link href="/campaigns" className="rounded-xl border border-border bg-surface-card px-5 py-3 text-sm font-bold text-foreground-heading">Save draft</Link><button className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"><Check size={17}/> Create campaign</button></div>
    </div>
  </RewardorShell>;
}
