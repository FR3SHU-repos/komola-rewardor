"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Keeps local image previews separate from remote URLs and revokes them safely. */
export function useObjectUrlPreview(initialUrl: string | null = null) {
  const [preview, setPreview] = useState<string | null>(initialUrl);
  const objectUrlRef = useRef<string | null>(null);

  const revokeObjectUrl = useCallback(() => {
    if (!objectUrlRef.current) return;
    URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
  }, []);

  const setFilePreview = useCallback(
    (file: File) => {
      revokeObjectUrl();
      const objectUrl = URL.createObjectURL(file);
      objectUrlRef.current = objectUrl;
      setPreview(objectUrl);
    },
    [revokeObjectUrl],
  );

  const setRemotePreview = useCallback(
    (url: string | null) => {
      revokeObjectUrl();
      setPreview(url);
    },
    [revokeObjectUrl],
  );

  useEffect(() => revokeObjectUrl, [revokeObjectUrl]);

  return { preview, setFilePreview, setRemotePreview };
}
