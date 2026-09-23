import Link from "next/link";

export default function CheckEmailPage() {
  return <main className="grid min-h-screen place-items-center bg-surface p-4"><section className="w-full max-w-md rounded-2xl border border-border bg-surface-card p-8 text-center shadow-sm"><div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground">✉</div><h1 className="mt-5 text-xl font-black text-foreground-heading">Check your email</h1><p className="mt-3 text-sm leading-6 text-foreground-muted">Open the verification link to activate your shared KOMOLA account. After verification, return here to finish creating your Rewardor organization.</p><Link className="mt-6 inline-block rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground" href="/login?next=/register">Return to sign in</Link></section></main>;
}
