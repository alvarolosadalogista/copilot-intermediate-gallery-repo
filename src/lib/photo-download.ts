export interface DownloadablePhoto {
  id: string;
  url: string;
  title: string;
}

const imageExtensions: Record<string, string> = {
  'image/avif': 'avif',
  'image/bmp': 'bmp',
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/svg+xml': 'svg',
  'image/tiff': 'tiff',
  'image/webp': 'webp',
};

function getExtension(contentType: string, url: string): string {
  const mimeType = contentType.split(';')[0].trim().toLowerCase();
  const mimeExtension = imageExtensions[mimeType];

  if (mimeExtension) {
    return mimeExtension;
  }

  const path = new URL(url, window.location.href).pathname;
  const urlExtension = path.match(/\.([a-z0-9]+)$/i)?.[1].toLowerCase();
  const knownExtension = Object.values(imageExtensions).find(extension => extension === urlExtension);

  if (mimeType.startsWith('image/') && knownExtension) {
    return knownExtension;
  }

  throw new Error('The photo is not a supported image.');
}

function getSafeFilename(title: string, id: string, extension: string): string {
  const safeTitle = title
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  const safeId = id.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 40) || 'photo';

  return `${safeTitle || `photo-${safeId}`}.${extension}`;
}

export async function downloadPhoto(photo: DownloadablePhoto): Promise<void> {
  const response = await fetch(photo.url);

  if (!response.ok) {
    throw new Error(`The photo could not be downloaded (HTTP ${response.status}).`);
  }

  const blob = await response.blob();

  if (blob.size === 0) {
    throw new Error('The photo file is empty.');
  }

  const extension = getExtension(response.headers.get('content-type') || blob.type, photo.url);
  const filename = getSafeFilename(photo.title, photo.id, extension);
  const link = document.createElement('a');
  const objectUrl = URL.createObjectURL(blob);
  link.href = objectUrl;
  link.download = filename;
  link.style.display = 'none';
  let downloadTriggered = false;

  try {
    document.body.appendChild(link);
    link.click();
    downloadTriggered = true;
  } finally {
    link.remove();
    if (downloadTriggered) {
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } else {
      URL.revokeObjectURL(objectUrl);
    }
  }
}
