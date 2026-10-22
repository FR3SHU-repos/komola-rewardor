export type ApiResult<T> = { success: boolean; message: string; data: T | null; status: number };
export type CampaignStatus = "draft" | "published" | "paused" | "expired" | "archived";
export type FulfillmentMethod = "home_delivery" | "store_pickup" | "online_redemption";
export type ApprovalMode = "automatic" | "manual";
export type RewardCampaign = { id: string; slug: string; title: string; description: string; campaignType: "product" | "offer" | "online_cashback"; rewardType: "fixed_points" | "bonus_points" | "points_multiplier"; points: number; totalClaimsAllowed: number; perBuyerLimit: number; timerEnabled: boolean; startsAt: string | null; endsAt: string | null; imageUrl: string; status: CampaignStatus; claims: number; locationCode: string; locationName: string; providerName: string; approvalMode: ApprovalMode; deliveryOptions: FulfillmentMethod[]; pickupStoreName: string | null; pickupStorePhone: string | null; pickupStoreAddress: Record<string, string>; createdAt?: string | null; updatedAt?: string | null };
export type RewardCampaignInput = Omit<RewardCampaign, "id" | "slug" | "status" | "claims" | "locationName" | "providerName" | "createdAt" | "updatedAt">;
export type RewardorOverview = { campaigns: number; publishedCampaigns: number; draftCampaigns: number; pausedCampaigns: number; archivedCampaigns: number; totalClaimsAllowed: number; potentialPoints: number };
export type PlatformLocation = { id: string; code: string; name: string; timezone: string; status?: string; enabled?: boolean };
export type RewardorClaimStatus = "claimed" | "approved" | "delivered" | "confirmed" | "redeemed" | "cancelled";
export type RewardorClaimActivity = { id: string; claimCode: string; status: RewardorClaimStatus; claimedAt: string; redeemedAt: string | null; approvedAt?: string | null; deliveredAt?: string | null; confirmedAt?: string | null; decisionReason?: string; campaignId: string; campaign: string; campaignSlug: string; buyer: string; buyerPhone: string; deliveryAddress?: Record<string, string>; fulfillmentMethod: FulfillmentMethod; pickupStoreName?: string | null; pickupStorePhone?: string | null; pickupStoreAddress?: Record<string, string>; points: number };
export type RewardorClaimsSummary = { totalClaimsAllowed: number; claimed: number; redeemed: number; pendingPoints: number };
export type RewardorClaimsMeta = { page: number; limit: number; total: number; totalPages: number };
export type RewardorClaimsData = { items: RewardorClaimActivity[]; summary: RewardorClaimsSummary; meta: RewardorClaimsMeta };
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
export type PrivacyPurpose = "core_service" | "market_intelligence" | "marketing";
export type PrivacyRequestType = "access" | "correction" | "erasure" | "nomination" | "grievance";
export type PrivacyRequestStatus = "submitted" | "in_review" | "completed" | "rejected";
export type PrivacyConsent = { purposeCode: PrivacyPurpose; granted: boolean; noticeVersion: string; occurredAt?: string };
export type PrivacyRequest = { id: string; requestType: PrivacyRequestType; details: string; status: PrivacyRequestStatus; createdAt: string; dueAt?: string; resolvedAt?: string | null; responseNote?: string | null };
export type PrivacyNotification = { id: string; privacyRequestId?: string; kind: string; title: string; message: string; createdAt: string; readAt?: string | null };
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
const configuredBase = (process.env.NEXT_PUBLIC_GO_API_URL ?? "").replace(/\/$/, "");
const base = /^https?:\/\//i.test(configuredBase)
  ? configuredBase
  : process.env.NODE_ENV === "production"
    ? "https://fr3shu-go-backend-api.onrender.com"
    : "";
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

const ORGANIZATION_CACHE_TTL_MS = 60_000;
let organizationCache: {
  token: string;
  selectedOrganizationId: string | null;
  organizationId: string | null;
  expiresAt: number;
} | null = null;
let organizationLookup: {
  token: string;
  selectedOrganizationId: string | null;
  promise: Promise<string | null>;
} | null = null;

function waitForAbort<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise;
  if (signal.aborted) {
    const error = new Error("Request aborted");
    error.name = "AbortError";
    return Promise.reject(error);
  }
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => {
      signal.removeEventListener("abort", onAbort);
      const error = new Error("Request aborted");
      error.name = "AbortError";
      reject(error);
    };
    signal.addEventListener("abort", onAbort, { once: true });
    promise.then(
      (value) => {
        signal.removeEventListener("abort", onAbort);
        resolve(value);
      },
      (error) => {
        signal.removeEventListener("abort", onAbort);
        reject(error);
      },
    );
  });
}

async function fetchOrganizationId(token: string, selectedOrganizationId: string | null): Promise<string | null> {
  try {
    const response = await fetch(`${base}/api/v1/pos/bootstrap`, {
      credentials: "include",
      headers: { Authorization: `Bearer ${token}`, ...(selectedOrganizationId ? { "X-Organization-ID": selectedOrganizationId } : {}) },
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
  return selectedOrganizationId;
}

async function resolveOrganizationId(token: string | null, signal?: AbortSignal): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const selectedOrganizationId = window.localStorage.getItem("komola:rewardor-organization-id");
  if (!token || !base) return null;

  if (
    organizationCache &&
    organizationCache.token === token &&
    organizationCache.selectedOrganizationId === selectedOrganizationId &&
    organizationCache.expiresAt > Date.now()
  ) {
    return waitForAbort(Promise.resolve(organizationCache.organizationId), signal);
  }

  if (
    !organizationLookup ||
    organizationLookup.token !== token ||
    organizationLookup.selectedOrganizationId !== selectedOrganizationId
  ) {
    const promise = fetchOrganizationId(token, selectedOrganizationId).then((organizationId) => {
      if (organizationLookup?.promise === promise) {
        organizationCache = {
          token,
          selectedOrganizationId,
          organizationId,
          expiresAt: Date.now() + ORGANIZATION_CACHE_TTL_MS,
        };
      }
      return organizationId;
    });
    organizationLookup = { token, selectedOrganizationId, promise };
    void promise.then(
      () => {
        if (organizationLookup?.promise === promise) organizationLookup = null;
      },
      () => {
        if (organizationLookup?.promise === promise) organizationLookup = null;
      },
    );
  }

  return waitForAbort(organizationLookup.promise, signal);
}

export async function rewardorApi<T>(path: string, options: RequestInit = {}, accessTokenOverride?: string): Promise<ApiResult<T>> {
  try {
    const token = accessTokenOverride ?? await accessToken();
    const organizationId = await resolveOrganizationId(token, options.signal ?? undefined);
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
    const message = /seller identity not found|active organization required|select an active rewardor organization|select an organization using x-organization-id/i.test(String(body.message ?? ""))
      ? "This account is not linked to an active Rewardor organization. Create one with Rewardor registration or sign in with an authorized account."
      : body.message ?? response.statusText;
    return { success: response.ok && body.success === true, message, data: body.data ?? null, status: response.status };
  } catch {
    return { success: false, message: "KOMOLA API is unreachable. Start the Go API and try again.", data: null, status: 0 };
  }
}

export const listRewardCampaigns = (options: RequestInit = {}) => rewardorApi<{ items: RewardCampaign[] }>("reward-campaigns", options);
export const getPlatformLocations = (options: RequestInit = {}) => rewardorApi<{ items: PlatformLocation[] }>("locations", options);
export const getRewardorBootstrap = (options: RequestInit = {}) => rewardorApi<RewardorBootstrap>("pos/bootstrap", options);
export const getRewardorOverview = (options: RequestInit = {}) => rewardorApi<RewardorOverview>("reward-campaigns/overview", options);
export const getRewardorClaims = (search = "", status = "", page = 1, options: RequestInit = {}) => {
  const params = new URLSearchParams();
  if (search.trim()) params.set("search", search.trim());
  if (status) params.set("status", status);
  params.set("page", String(Math.max(1, page)));
  params.set("limit", "10");
  const query = params.toString();
  return rewardorApi<RewardorClaimsData>(`reward-campaigns/claims${query ? `?${query}` : ""}`, options);
};
export const approveRewardClaim = (claimId: string) => rewardorApi<{ id: string; status: string; points: number }>(`reward-campaigns/claims/${encodeURIComponent(claimId)}/approve`, { method: "POST", body: JSON.stringify({}) });
export const rejectRewardClaim = (claimId: string, reason = "") => rewardorApi<{ id: string; status: string; points: number }>(`reward-campaigns/claims/${encodeURIComponent(claimId)}/reject`, { method: "POST", body: JSON.stringify({ reason }) });
export const deliverRewardClaim = (claimId: string) => rewardorApi<{ id: string; status: "delivered"; points: number; deliveredAt: string }>(`reward-campaigns/claims/${encodeURIComponent(claimId)}/deliver`, { method: "POST", body: JSON.stringify({}) });
export const getRewardorAnalytics = (days = 30, options: RequestInit = {}) => rewardorApi<RewardorAnalytics>(`reward-campaigns/analytics?days=${days}`, options);
export const getRewardCampaign = (id: string, options: RequestInit = {}) => rewardorApi<RewardCampaign>(`reward-campaigns/${encodeURIComponent(id)}`, options);
export const createRewardCampaign = (body: RewardCampaignInput) => rewardorApi<RewardCampaign>("reward-campaigns", { method: "POST", body: JSON.stringify(body) });
export const updateRewardCampaign = (id: string, body: RewardCampaignInput) => rewardorApi<RewardCampaign>(`reward-campaigns/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(body) });
export const updateRewardCampaignImage = (id: string, imageUrl: string) => rewardorApi<RewardCampaign>(`reward-campaigns/${encodeURIComponent(id)}/image`, { method: "PATCH", body: JSON.stringify({ imageUrl }) });
export const transitionRewardCampaign = (id: string, action: "publish" | "pause" | "archive") => rewardorApi<RewardCampaign>(`reward-campaigns/${encodeURIComponent(id)}/${action}`, { method: "POST", body: JSON.stringify({}) });
export const reconcileRewardorIdentity = (accessTokenOverride?: string) => rewardorApi<{ onboardingComplete: boolean }>("auth/reconcile", { method: "POST", body: JSON.stringify({}) }, accessTokenOverride);
export const registerRewardorOrganization = (body: RewardorOrganizationRegistration, idempotencyKey: string, accessTokenOverride?: string) => rewardorApi<RewardorOrganizationRegistrationResult>("seller-organizations", { method: "POST", headers: { "Idempotency-Key": idempotencyKey }, body: JSON.stringify(body) }, accessTokenOverride);
export const getPrivacyConsents = () => rewardorApi<{ items: PrivacyConsent[] }>("me/privacy/consents");
export const recordPrivacyConsent = (purposeCode: PrivacyPurpose, granted: boolean, noticeVersion = "1.0.0") => rewardorApi<PrivacyConsent>("me/privacy/consents", { method: "POST", body: JSON.stringify({ purposeCode, action: granted ? "granted" : "withdrawn", noticeVersion, source: "rewardor-web" }) });
export const getPrivacyRequests = () => rewardorApi<{ items: PrivacyRequest[]; notifications?: PrivacyNotification[] }>("me/privacy/requests");
export const submitPrivacyRequest = (requestType: PrivacyRequestType, details: string) => rewardorApi<PrivacyRequest>("me/privacy/requests", { method: "POST", body: JSON.stringify({ requestType, details }) });
export const privacyExport = () => rewardorApi<Record<string, unknown>>("me/privacy/export");
