export type ApiResult<T> = { success: boolean; message: string; data: T | null; status: number };
const base = (process.env.NEXT_PUBLIC_GO_API_URL ?? "").replace(/\/$/, "");
export async function rewardorApi<T>(path: string, options: RequestInit = {}): Promise<ApiResult<T>> {
  const response = await fetch(`${base}/api/v1/${path.replace(/^\//, "")}`, { ...options, headers: { "Content-Type": "application/json", ...(options.headers ?? {}) } });
  const body = await response.json().catch(() => ({}));
  return { success: response.ok && body.success === true, message: body.message ?? response.statusText, data: body.data ?? null, status: response.status };
}
