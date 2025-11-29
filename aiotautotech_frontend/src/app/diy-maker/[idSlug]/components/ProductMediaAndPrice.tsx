// src/app/diy-maker/[idSlug]/components/ProductMediaAndPrice.tsx

'use client';
import { useState, useEffect } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassPlusIcon,
} from '@heroicons/react/24/outline';

/* eslint-disable @next/next/no-img-element */

export interface ProductMediaAndPriceProps {
  mainImage?: string;
  galleryUrls?: string[];
  lightboxUrls?: string[];
  short_description?: string;

  priceLabel?: string;
  statusLabel?: string;
  typeLabel?: string;
  tags?: string[];

  stock_tracking?: boolean;
  stock_qty?: number | null;
  min_order_qty?: number | null;
  currency?: string;
}

export function ProductMediaAndPrice({
  mainImage,
  galleryUrls = [],
  lightboxUrls = [],
  short_description,
  priceLabel,
  statusLabel,
  typeLabel,
  tags = [],
  stock_tracking,
  stock_qty,
  min_order_qty,
  currency,
}: ProductMediaAndPriceProps) {
  const [displayedImage, setDisplayedImage] = useState(mainImage);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [previousImage, setPreviousImage] = useState<string | undefined>(
    undefined
  );
  const [animation, setAnimation] = useState<{
    current: string;
    prev: string;
  } | null>(null);
  const [openLightbox, setOpenLightbox] = useState(false);

  useEffect(() => {
    setDisplayedImage(mainImage);
    setPreviousImage(undefined);
  }, [mainImage]);

  const allGalleryUrls = lightboxUrls.length > 0 ? lightboxUrls : galleryUrls;
  const hasGallery = allGalleryUrls.length > 0;

  const minSwipeDistance = 50;

  const handleChangeImage = (newImageUrl: string) => {
    if (newImageUrl === displayedImage || animation) return;

    const currentIndex = allGalleryUrls.findIndex(
      (url) => url === displayedImage
    );
    const newIndex = allGalleryUrls.findIndex((url) => url === newImageUrl);

    // Xác định hướng trượt
    const direction = newIndex > currentIndex ? 'next' : 'prev';

    setPreviousImage(displayedImage);
    setDisplayedImage(newImageUrl);

    if (direction === 'next') {
      setAnimation({ current: 'slide-in-right', prev: 'slide-out-left' });
    } else {
      setAnimation({ current: 'slide-in-left', prev: 'slide-out-right' });
    }

    // Xóa animation sau khi hoàn tất để chuẩn bị cho lần chuyển tiếp theo
    setTimeout(() => {
      setAnimation(null);
      setPreviousImage(undefined);
    }, 250); // Thời gian phải khớp với duration của animation
  };

  const goToNextImage = () => {
    if (!hasGallery) return;
    const currentIndex = allGalleryUrls.findIndex(
      (url) => url === displayedImage
    );
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % allGalleryUrls.length;
    handleChangeImage(allGalleryUrls[nextIndex]);
  };

  const goToPrevImage = () => {
    if (!hasGallery) return;
    const currentIndex = allGalleryUrls.findIndex(
      (url) => url === displayedImage
    );
    if (currentIndex === -1) return;
    const prevIndex =
      (currentIndex - 1 + allGalleryUrls.length) % allGalleryUrls.length;
    handleChangeImage(allGalleryUrls[prevIndex]);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null); // Reset touch end position
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || !hasGallery) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      if (isLeftSwipe) {
        // Vuốt sang trái -> ảnh tiếp theo
        goToNextImage();
      } else {
        // Vuốt sang phải -> ảnh trước đó
        goToPrevImage();
      }
    }
  };

  const displayCurrency = currency || 'VND';

  const stockLabel = (() => {
    if (!stock_tracking) return 'Không theo dõi tồn kho';
    if (stock_qty == null) return 'Chưa cập nhật số lượng';
    if (stock_qty <= 0) return 'Hết hàng';
    return `Còn khoảng ${stock_qty} sản phẩm`;
  })();

  const minOrderLabel =
    min_order_qty && min_order_qty > 1
      ? `Tối thiểu ${min_order_qty} sản phẩm / đơn`
      : 'Không giới hạn số lượng tối thiểu';

  return (
    <>
      <section className="grid gap-5 rounded-2xl bg-[#050608] shadow-[0_18px_40px_rgba(0,0,0,0.45)] lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1.1fr)]">
        {/* Cột trái: Ảnh & gallery */}
        <div
          className="space-y-3 pt-2"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div
            className="group relative cursor-pointer overflow-hidden rounded-xl bg-black/60"
            onClick={() => setOpenLightbox(true)}
          >
            {displayedImage ? (
              <>
                {previousImage && (
                  <img
                    src={previousImage}
                    alt="Ảnh sản phẩm cũ"
                    className={`absolute inset-0 h-full w-full bg-black object-contain ${
                      animation?.prev || ''
                    }`}
                  />
                )}
                <img
                  src={displayedImage}
                  alt="Ảnh sản phẩm"
                  className={`relative h-full w-full aspect-[3/2] bg-transparent object-contain ${
                    animation?.current || ''
                  }`}
                />
              </>
            ) : (
              <div className="flex aspect-[3/2] w-full items-center justify-center text-xs text-gray-500">
                Chưa có hình ảnh chính cho sản phẩm này.
              </div>
            )}

            {/* Nút điều hướng trái/phải */}
            {hasGallery && (
              <>
                <button
                  type="button"
                  onClick={goToPrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white opacity-0 transition-opacity hover:bg-black/50 group-hover:opacity-100"
                  aria-label="Ảnh trước"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={goToNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white opacity-0 transition-opacity hover:bg-black/50 group-hover:opacity-100"
                  aria-label="Ảnh tiếp theo"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenLightbox(true);
                  }}
                  className="absolute right-2 top-2 rounded-full bg-black/30 p-1.5 text-white opacity-0 transition-opacity hover:bg-black/50 group-hover:opacity-100"
                  aria-label="Phóng to ảnh"
                >
                  <MagnifyingGlassPlusIcon className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {/* Gallery thumbnails (nếu có) */}
          {hasGallery && (
            <div className="flex flex-wrap justify-center gap-2">
              {galleryUrls.slice(0, 6).map((url, idx) => (
                <div
                  key={`${url}-${idx}`}
                  onClick={() => handleChangeImage(url)}
                  className={`h-14 w-14 cursor-pointer overflow-hidden rounded-lg bg-black/60 transition-all duration-200 ${
                    displayedImage === url
                      ? 'border-2 border-blue-400'
                      : 'border-2 border-transparent hover:border-gray-500'
                  }`}
                >
                  <img
                    src={url}
                    alt={`Thumb ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
              {galleryUrls.length > 6 && (
                <span className="flex h-14 items-center justify-center rounded-lg border border-dashed border-gray-700 bg-black/50 px-3 text-[11px] text-gray-400">
                  +{galleryUrls.length - 6} ảnh khác
                </span>
              )}
            </div>
          )}
        </div>

        {/* Cột phải: Giá, trạng thái, kho */}
        <div className="flex flex-col justify-between rounded-2xl border border-gray-800 bg-black/40 p-4 text-xs text-gray-300">
          <div className="space-y-3">
            {/* Mô tả ngắn */}
            {short_description && (
              <p className="mb-4 text-sm leading-relaxed text-gray-300">
                {short_description}
              </p>
            )}

            {/* Giá */}
            <div>
              <div className="text-[11px] uppercase tracking-wide text-gray-500">
                Giá tham khảo
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <div className="text-xl font-semibold text-blue-300">
                  {priceLabel || 'Liên hệ'}
                </div>
                <span className="text-[11px] text-gray-500">
                  {displayCurrency}
                </span>
              </div>
            </div>

            {/* Trạng thái */}
            <div className="flex flex-wrap items-center gap-2">
              {statusLabel && statusLabel !== 'Nháp' && (
                <span className="inline-flex items-center rounded-full border border-emerald-500/60 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-100">
                  {statusLabel}
                </span>
              )}
              {typeLabel && (
                <span className="inline-flex items-center rounded-full border border-gray-600 px-2.5 py-1 text-[11px] font-medium text-gray-200">
                  {typeLabel}
                </span>
              )}
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full border border-blue-500/50 bg-blue-500/10 px-2.5 py-1 text-[11px] font-medium text-blue-200"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Kho hàng */}
            <div className="mt-2 space-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Tồn kho & đặt hàng
              </div>
              <p className="text-[12px] text-gray-200">{stockLabel}</p>
              <p className="text-[11px] text-gray-400">{minOrderLabel}</p>
            </div>
          </div>

          {/* Gợi ý CTA / ghi chú */}
          <div className="mt-4 rounded-xl border border-dashed border-gray-700 bg-black/40 px-3 py-3 text-[11px] text-gray-400">
            <p>
              Đây là giá tham khảo cho cộng đồng DIY / maker. Với đơn hàng số
              lượng lớn hoặc tuỳ chỉnh theo yêu cầu (thay đổi độ dài trục, loại
              động cơ, cảm biến, v.v.) bạn có thể liên hệ trực tiếp để trao đổi
              thêm.
            </p>
          </div>
        </div>
      </section>

      {/* Lightbox được cung cấp bởi yet-another-react-lightbox */}
      <Lightbox
        open={openLightbox}
        close={() => setOpenLightbox(false)}
        slides={allGalleryUrls.map((url) => ({ src: url }))}
        index={allGalleryUrls.findIndex((url) => url === displayedImage)}
        plugins={[Zoom]}
        zoom={{ maxZoomPixelRatio: 3 }}
        styles={{ container: { backgroundColor: 'rgba(0, 0, 0, .85)' } }}
      />
    </>
  );
}
