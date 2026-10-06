import Link from "next/link";

export const metadata = {
  title: "Privacy notice | KOMOLA Rewardor",
  description: "How KOMOLA processes buyer, seller, campaign and claim data.",
};

export default function PrivacyPage() {
  return <main className="min-h-screen bg-surface px-4 py-10 sm:px-8">
    <article className="mx-auto max-w-3xl rounded-2xl border border-border bg-surface-card p-6 shadow-sm sm:p-10">
      <Link href="/login" className="text-sm font-semibold text-primary hover:underline">← Back to Rewardor</Link>
      <p className="mt-8 text-sm font-semibold text-primary">KOMOLA privacy notice</p>
      <h1 className="mt-2 text-3xl font-black text-foreground-heading">Your data, explained clearly</h1>
      <p className="mt-3 text-sm text-foreground-muted">Version 2026-10-06 · Last updated 6 October 2026</p>
      <p className="mt-6 leading-7 text-foreground-muted">Rewardor uses shared KOMOLA identity and organization records. This notice explains the main personal and business data processed when you create a Rewardor workspace, publish campaigns, or verify reward claims.</p>
      <div className="mt-8 space-y-7">
        <section><h2 className="text-lg font-black text-foreground-heading">What we collect</h2><p className="mt-2 leading-7 text-foreground-muted">Account name, email, mobile number, organization and contact details, business address, location, roles, campaign settings, pickup-store details, approval decisions, and the buyer name, phone, claim code and fulfillment information needed to process a reward claim.</p></section>
        <section><h2 className="text-lg font-black text-foreground-heading">Why we use it</h2><p className="mt-2 leading-7 text-foreground-muted">We use it to authenticate users, manage organization access, publish and measure campaigns, verify buyers, approve or reject claims, settle Komola Coins, prevent misuse, provide support, and maintain auditable business records.</p></section>
        <section><h2 className="text-lg font-black text-foreground-heading">Buyer information shown to Rewardors</h2><p className="mt-2 leading-7 text-foreground-muted">A Rewardor should receive only the buyer phone, claim code and delivery or pickup details needed for active claim verification and fulfillment. Buyer information must not be copied, exported or reused for unrelated marketing or profiling.</p></section>
        <section><h2 className="text-lg font-black text-foreground-heading">Your choices and rights</h2><p className="mt-2 leading-7 text-foreground-muted">You may request information about processing, correction, completion, updating, erasure where retention is not required, consent withdrawal, nomination and grievance redressal. Contact the KOMOLA team through the support route shown in your account and include enough information for identity verification.</p></section>
        <section><h2 className="text-lg font-black text-foreground-heading">Retention and security</h2><p className="mt-2 leading-7 text-foreground-muted">KOMOLA retains records only for account, campaign, claim, settlement, support, security or legal purposes. Access is controlled through authenticated APIs and organization membership. No online system can guarantee absolute security.</p></section>
      </div>
      <section className="mt-8 rounded-xl bg-surface p-5"><h2 className="text-lg font-black text-foreground-heading">Questions or privacy requests</h2><p className="mt-2 leading-7 text-foreground-muted">Use the support channel shown in your KOMOLA workspace. We will publish the responsible privacy contact and request workflow as the service expands.</p></section>
      <p className="mt-8 text-xs leading-6 text-foreground-muted">This notice supports KOMOLA’s implementation of India’s Digital Personal Data Protection framework. It is not legal advice and may be updated when the product, providers or applicable requirements change.</p>
    </article>
  </main>;
}
