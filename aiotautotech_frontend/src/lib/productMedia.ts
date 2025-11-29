// src/lib/productMedia.ts

export interface ProductImage {
  id?: string;
  url?: string; // large
  url_medium?: string;
  url_thumb?: string;
  fileName?: string;
  alt?: string;
  title?: string;
  type?: string;
  isPrimary?: boolean;
}

type ImageSize = 'large' | 'medium' | 'thumb';

/**
 * Lấy đối tượng ảnh chính (isPrimary: true) từ danh sách.
 * Nếu không có, trả về ảnh đầu tiên trong danh sách.
 * Nếu danh sách rỗng, trả về undefined.
 */
export function getPrimaryImageFromImages<T extends ProductImage>(
  images: T[]
): T | undefined {
  if (!Array.isArray(images) || images.length === 0) {
    return undefined;
  }
  const primary = images.find((img) => img.isPrimary);
  return primary || images[0];
}

/**
 * Lấy URL của ảnh chính theo kích thước mong muốn.
 * @param images Mảng các đối tượng ảnh.
 * @param size Kích thước mong muốn ('large', 'medium', 'thumb').
 * @returns URL của ảnh hoặc undefined nếu không tìm thấy.
 */
export function getPrimaryImageUrl(
  images: ProductImage[],
  size: ImageSize = 'large'
): string | undefined {
  const primaryImage = getPrimaryImageFromImages(images);
  if (!primaryImage) return undefined;

  switch (size) {
    case 'thumb':
      return (
        primaryImage.url_thumb || primaryImage.url_medium || primaryImage.url
      );
    case 'medium':
      return (
        primaryImage.url_medium || primaryImage.url || primaryImage.url_thumb
      );
    case 'large':
    default:
      return (
        primaryImage.url || primaryImage.url_medium || primaryImage.url_thumb
      );
  }
}

/**
 * Lấy danh sách URL của tất cả ảnh trong gallery theo kích thước mong muốn.
 */
export function getGalleryUrlsFromImages(
  images: ProductImage[],
  size: ImageSize = 'thumb'
): string[] {
  if (!Array.isArray(images)) return [];

  return images
    .map((img) => getPrimaryImageUrl([img], size)) // Tái sử dụng logic lấy URL theo size
    .filter((url): url is string => !!url);
}
