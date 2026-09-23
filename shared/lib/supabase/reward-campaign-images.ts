"use client";

import { createAuthBrowserClient } from "@/shared/lib/supabase/auth-client";

// Reuse the existing public-read bucket already used by POS product images.
// The object path keeps Rewardor media separate from catalogue media.
const BUCKET = "product-images";

export async function uploadRewardCampaignImage(file: File): Promise<string> {
  if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
    throw new Error("Upload a JPG, PNG, or WebP image.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Campaign images must be 5 MB or smaller.");
  }

  const client = createAuthBrowserClient();
  const { data: { session } } = await client.auth.getSession();
  if (!session) throw new Error("Your session has expired. Sign in again and retry.");

  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `rewardor/campaigns/${crypto.randomUUID()}.${extension}`;
  const { error } = await client.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error(error.message || "Campaign image upload failed.");

  return client.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
