// src/lib/productMedia.ts

export type AnyProductImage = {
  url?: string;
  url_medium?: string;
  url_thumb?: string;
  type?: string;
  isPrimary?: boolean;
  // các field khác (alt, title, fileName, ...) sẽ được giữ nguyên nếu có
  // nhưng không bắt buộc cho helper này
  [key: string]: any;
};

/**
 * Chọn ảnh "primary" từ mảng images:
 * 1. Ưu tiên isPrimary = true và có url/url_medium/url_thumb
 * 2. Sau đó type = "cover"
 * 3. Cuối cùng là phần tử đầu tiên có url/url_medium/url_thumb
 */
export function getPrimaryImageFromImages<T extends AnyProductImage>(
  images?: T[] | null
): T | undefined {
  if (!Array.isArray(images) || images.length === 0) return undefined;

  const withUrl = images.filter(
    (img) => img && (img.url || img.url_medium || img.url_thumb)
  ) as T[];

  if (withUrl.length === 0) return undefined;

  return (
    withUrl.find((img) => img.isPrimary) ||
    withUrl.find((img) => img.type === 'cover') ||
    withUrl[0]
  );
}

/**
 * Lấy URL ảnh chính:
 * - Nguồn chính: images (isPrimary / cover / phần tử đầu)
 * - Fallback cho dữ liệu cũ: phần tử đầu của gallery_urls
 */
export function getMainImageUrlFromImagesAndGallery<
  T extends AnyProductImage
>(params: {
  images?: T[] | null;
  gallery_urls?: string[] | null;
}): string | undefined {
  const { images, gallery_urls } = params;

  const primary = getPrimaryImageFromImages(images);
  const candidate =
    primary?.url_thumb || primary?.url_medium || primary?.url || undefined;
  if (candidate) return candidate;

  if (Array.isArray(gallery_urls) && gallery_urls.length > 0) {
    const first = (gallery_urls[0] || '').trim();
    return first.length > 0 ? first : undefined;
  }

  return undefined;
}

/**
 * Lấy danh sách URL gallery:
 * - Nếu gallery_urls có dữ liệu -> dùng luôn (dữ liệu cũ)
 * - Nếu không -> map từ images (ưu tiên url_medium, fallback url / url_thumb)
 */
export function getGalleryUrlsFromImagesAndLegacy<
  T extends AnyProductImage
>(params: { images?: T[] | null; gallery_urls?: string[] | null }): string[] {
  const { images, gallery_urls } = params;

  if (Array.isArray(gallery_urls) && gallery_urls.length > 0) {
    return gallery_urls
      .map((u) => (typeof u === 'string' ? u.trim() : ''))
      .filter((u) => u.length > 0);
  }

  if (!Array.isArray(images)) return [];

  const urls: string[] = [];
  images.forEach((img) => {
    if (!img) return;
    const u = (img.url_medium || img.url || img.url_thumb || '')
      .toString()
      .trim();
    if (u.length > 0) urls.push(u);
  });

  return urls;
}
