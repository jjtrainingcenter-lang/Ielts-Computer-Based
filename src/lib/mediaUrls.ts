export type MediaKind = 'audio' | 'image';

const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

export const extractGoogleDriveFileId = (rawUrl?: string | null): string | null => {
  const value = (rawUrl || '').trim();
  if (!value) return null;

  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    const isDriveHost =
      host === 'drive.google.com' ||
      host === 'docs.google.com' ||
      host === 'drive.usercontent.google.com';

    if (!isDriveHost) return null;

    const pathMatch = url.pathname.match(/\/file\/d\/([^/]+)/i) || url.pathname.match(/\/d\/([^/]+)/i);
    if (pathMatch?.[1]) return decodeURIComponent(pathMatch[1]);

    const id = url.searchParams.get('id');
    if (id) return id;
  } catch {
    // Not a valid absolute URL. Leave it untouched and let the browser report it.
  }

  return null;
};

export const isGoogleDriveUrl = (rawUrl?: string | null) => !!extractGoogleDriveFileId(rawUrl);

export const getGoogleDrivePreviewUrl = (rawUrl?: string | null): string | null => {
  const id = extractGoogleDriveFileId(rawUrl);
  return id ? `https://drive.google.com/file/d/${encodeURIComponent(id)}/preview` : null;
};

/**
 * Convert a normal Google Drive sharing URL into browser-consumable media URLs.
 * We keep several candidates because Google may redirect differently depending
 * on file size, account state and the public-sharing configuration.
 */
export const getMediaUrlCandidates = (rawUrl: string | undefined, kind: MediaKind): string[] => {
  const value = (rawUrl || '').trim();
  if (!value) return [];

  const id = extractGoogleDriveFileId(value);
  if (!id) return [value];

  const encodedId = encodeURIComponent(id);

  if (kind === 'image') {
    return unique([
      `https://drive.google.com/thumbnail?id=${encodedId}&sz=w2000`,
      `https://drive.google.com/uc?export=view&id=${encodedId}`,
      `https://drive.usercontent.google.com/download?id=${encodedId}&export=view&confirm=t`,
    ]);
  }

  return unique([
    `https://drive.google.com/uc?export=download&id=${encodedId}`,
    `https://drive.usercontent.google.com/download?id=${encodedId}&export=download&confirm=t`,
    `https://docs.google.com/uc?export=download&id=${encodedId}`,
  ]);
};
