export type ApiResult<T> = { success: boolean; message: string; data: T | null; status: number };
export type CampaignStatus = "draft" | "published" | "paused" | "expired" | "archived";
export type FulfillmentMethod = "home_delivery" | "store_pickup" | "online_redemption";
export type ApprovalMode = "automatic" | "manual";
export type RewardCampaign = { id: string; slug: string; title: string; description: string; campaignType: "product" | "offer" | "online_cashback"; rewardType: "fixed_points" | "bonus_points" | "points_multiplier"; points: number; totalClaimsAllowed: number; perBuyerLimit: number; timerEnabled: boolean; startsAt: string | null; endsAt: string | null; imageUrl: string; status: CampaignStatus; claims: number; locationCode: string; locationName: string; providerName: string; approvalMode: ApprovalMode; deliveryOptions: FulfillmentMethod[]; pickupStoreName: string | null; pickupStorePhone: string | null; pickupStoreAddress: Record<string, string>; createdAt?: string | null; updatedAt?: string | null };
export type RewardCampaignInput = Omit<RewardCampaign, "id" | "slug" | "status" | "claims" | "locationName" | "providerName" | "createdAt" | "updatedAt">;
export type RewardorOverview = { campaigns: number; publishedCampaigns: number; draftCampaigns: number; pausedCampaigns: number; archivedCampaigns: number; totalClaimsAllowed: number; potentialPoints: number };
export type RewardorClaimStatus = "claimed" | "approved" | "redeemed" | "cancelled";
export type RewardorClaimActivity = { id: string; claimCode: string; status: RewardorClaimStatus; claimedAt: string; redeemedAt: string | null; approvedAt?: string | null; decisionReason?: string; campaignId: string; campaign: string; campaignSlug: string; buyer: string; buyerPhone: string; deliveryAddress?: Record<string, string>; fulfillmentMethod: FulfillmentMethod; pickupStoreName?: string | null; pickupStorePhone?: string | null; pickupStoreAddress?: Record<string, string>; points: number };
export type RewardorClaimsSummary = { totalClaimsAllowed: number; claimed: number; redeemed: number; pendingPoints: number };
export type RewardorClaimsData = { items: RewardorClaimActivity[]; summary: RewardorClaimsSummary };
export type RewardorAnalyticsPoint = { date: string; claims: number };
export type RewardorAnalytics = {
  periodDays: number;
  claims: number;
  redemptions: number;
  conversionRate: number;
  pointsIssued: number;
  claimsChangePercent: number | null;
  redemptionsChangePercent: number | null;
  conversionChangePercent: number | null;
  pointsIssuedChangePercent: number | null;
  series: RewardorAnalyticsPoint[];
};
export type RewardorOrganizationRegistration = {
  organization: {
    legalName: string;
    displayName: string;
    contactName: string;
    type: "Rewardor";
    phoneE164: string;
    billingAddress: { line1: string; line2: string; city: string; state: string; postalCode: string; country: "India" };
  };
  location: {
    code: "visakhapatnam";
    name: "Visakhapatnam";
    timezone: "Asia/Kolkata";
    phoneE164: string;
    address: { line1: string; line2: string; city: string; state: string; postalCode: string; country: "India" };
  };
};
export type RewardorOrganizationRegistrationResult = { organization?: { id?: string; name?: string; status?: string; sellerType?: string }; location?: { id?: string; name?: string }; created?: boolean; reused?: boolean };
export type RewardorBootstrap = {
  user: { id: string; name: string; email: string; role: string; roles?: string[]; orgId: string; orgType: string; locationId: string };
  organization?: {
    organizationId?: string;
    displayName?: string;
    sellerType?: string;
    organization?: { displayName?: string; legalName?: string; type?: string; status?: string; phoneE164?: string };
    membership?: { roles?: string[] };
    locations?: Array<{ id: string; code: string; name: string; active: boolean }>;
  };
};
const base = (process.env.NEXT_PUBLIC_GO_API_URL ?? "").replace(/\/$/, "");
async function accessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const { createAuthBrowserClient } = await import("@/shared/lib/supabase/auth-client");
  const { data } = await createAuthBrowserClient().auth.getSession();
  return data.session?.access_token ?? null;
}

async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const { createAuthBrowserClient } = await import("@/shared/lib/supabase/auth-client");
    const { data } = await createAuthBrowserClient().auth.refreshSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

async function resolveOrganizationId(token: string | null): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem("komola:rewardor-organization-id");
  if (!token || !base) return null;
  try {
    const response = await fetch(`${base}/api/v1/pos/bootstrap`, {
      credentials: "include",
      headers: { Authorization: `Bearer ${token}`, ...(stored ? { "X-Organization-ID": stored } : {}) },
    });
    const body = await response.json().catch(() => ({}));
    const organizationId = body?.data?.user?.orgId;
    if (response.ok && typeof organizationId === "string" && organizationId) {
      window.localStorage.setItem("komola:rewardor-organization-id", organizationId);
      return organizationId;
    }
    if (response.ok || [401, 403, 404].includes(response.status)) {
      // Organization selection is scoped to the current Supabase account.
      // Clear stale selections after switching accounts or losing access.
      window.localStorage.removeItem("komola:rewardor-organization-id");
      return null;
    }
  } catch {
    // Keep the previous organization selection during transient failures.
  }
  return stored;
}

export async function rewardorApi<T>(path: string, options: RequestInit = {}): Promise<ApiResult<T>> {
  try {
    const token = await accessToken();
    const organizationId = await resolveOrganizationId(token);
    const target = `${base}/api/v1/${path.replace(/^\//, "")}`;
    const requestWithToken = (accessToken: string | null) => fetch(target, { ...options, credentials: "include", headers: { "Content-Type": "application/json", ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}), ...(organizationId ? { "X-Organization-ID": organizationId } : {}), ...(options.headers ?? {}) } });
    let response = await requestWithToken(token);
    if (response.status === 401) {
      const refreshedToken = await refreshAccessToken();
      if (refreshedToken && refreshedToken !== token) {
        response = await requestWithToken(refreshedToken);
      }
    }
    const body = await response.json().catch(() => ({}));
    const message = /seller identity not found|active organization required|select an active rewardor organization/i.test(String(body.message ?? ""))
      ? "This account is not linked to an active Rewardor organization. Create one with Rewardor registration or sign in with an authorized account."
      : body.message ?? response.statusText;
    return { success: response.ok && body.success === true, message, data: body.data ?? null, status: response.status };
  } catch {
    return { success: false, message: "KOMOLA API is unreachable. Start the Go API and try again.", data: null, status: 0 };
  }
}

export const listRewardCampaigns = () => rewardorApi<{ items: RewardCampaign[] }>("reward-campaigns");
export const getRewardorBootstrap = () => rewardorApi<RewardorBootstrap>("pos/bootstrap");
export const getRewardorOverview = () => rewardorApi<RewardorOverview>("reward-campaigns/overview");
export const getRewardorClaims = (search = "", status = "") => {
  const params = new URLSearchParams();
  if (search.trim()) params.set("search", search.trim());
  if (status) params.set("status", status);
  const query = params.toString();
  return rewardorApi<RewardorClaimsData>(`reward-campaigns/claims${query ? `?${query}` : ""}`);
};
export const approveRewardClaim = (claimId: string) => rewardorApi<{ id: string; status: string; points: number }>(`reward-campaigns/claims/${encodeURIComponent(claimId)}/approve`, { method: "POST", body: JSON.stringify({}) });
export const rejectRewardClaim = (claimId: string, reason = "") => rewardorApi<{ id: string; status: string; points: number }>(`reward-campaigns/claims/${encodeURIComponent(claimId)}/reject`, { method: "POST", body: JSON.stringify({ reason }) });
export const getRewardorAnalytics = (days = 30) => rewardorApi<RewardorAnalytics>(`reward-campaigns/analytics?days=${days}`);
export const getRewardCampaign = (id: string) => rewardorApi<RewardCampaign>(`reward-campaigns/${encodeURIComponent(id)}`);
export const createRewardCampaign = (body: RewardCampaignInput) => rewardorApi<RewardCampaign>("reward-campaigns", { method: "POST", body: JSON.stringify(body) });
export const updateRewardCampaign = (id: string, body: RewardCampaignInput) => rewardorApi<RewardCampaign>(`reward-campaigns/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(body) });
export const updateRewardCampaignImage = (id: string, imageUrl: string) => rewardorApi<RewardCampaign>(`reward-campaigns/${encodeURIComponent(id)}/image`, { method: "PATCH", body: JSON.stringify({ imageUrl }) });
export const transitionRewardCampaign = (id: string, action: "publish" | "pause" | "archive") => rewardorApi<RewardCampaign>(`reward-campaigns/${encodeURIComponent(id)}/${action}`, { method: "POST", body: JSON.stringify({}) });
export const reconcileRewardorIdentity = () => rewardorApi<{ onboardingComplete: boolean }>("auth/reconcile", { method: "POST", body: JSON.stringify({}) });
export const registerRewardorOrganization = (body: RewardorOrganizationRegistration, idempotencyKey: string) => rewardorApi<RewardorOrganizationRegistrationResult>("seller-organizations", { method: "POST", headers: { "Idempotency-Key": idempotencyKey }, body: JSON.stringify(body) });
