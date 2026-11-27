'use client';

import { useEffect, useState } from 'react';

export function DesignThumbnail({ src, alt, className, accessToken }: {
  src: string;
  alt: string;
  className: string;
  accessToken?: string;
}) {
  const [privateUrl, setPrivateUrl] = useState<string>();
  const isPrivate = src.startsWith('/api/lab-thumbnails/');

  useEffect(() => {
    if (!isPrivate || !accessToken) return;
    const controller = new AbortController();
    let objectUrl: string | undefined;
    fetch(src, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: controller.signal,
      cache: 'no-store',
    }).then(async response => {
      if (!response.ok) throw new Error(`Thumbnail request failed: ${response.status}`);
      const blob = await response.blob();
      if (controller.signal.aborted) return;
      objectUrl = URL.createObjectURL(blob);
      setPrivateUrl(objectUrl);
    }).catch(error => {
      if (!controller.signal.aborted) console.error('Failed to load thumbnail:', error);
    });
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setPrivateUrl(undefined);
    };
  }, [src, accessToken, isPrivate]);

  const imageUrl = isPrivate ? privateUrl : src;
  return imageUrl ? <img src={imageUrl} alt={alt} className={className} /> : null;
}
