// src/app/diy-maker/[idSlug]/components/ProductMediaAndPrice.tsx

'use client';
import { useState, useEffect } from 'react';
import { TechnicalDoc } from './technical-doc';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import dynamic from 'next/dynamic';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassPlusIcon,
  XMarkIcon,
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

  technical_docs?: TechnicalDoc[];
  currency?: string;
}

// Tải ModelViewer động
const ModelViewer = dynamic(() => import('./ModelViewer'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-[#111] rounded-md flex items-center justify-center text-sm text-gray-400">
      Đang tải trình xem 3D...
    </div>
  ),
});

export function ProductMediaAndPrice({
  mainImage,
  galleryUrls = [],
  lightboxUrls = [],
  short_description,
  priceLabel,
  statusLabel,
  typeLabel,
  tags = [],
  technical_docs = [],
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
  const [viewingStlInModal, setViewingStlInModal] =
    useState<TechnicalDoc | null>(null);

  useEffect(() => {
    setDisplayedImage(mainImage);
    setPreviousImage(undefined);
  }, [mainImage]);

  const allGalleryUrls = lightboxUrls.length > 0 ? lightboxUrls : galleryUrls;
  const hasGallery = allGalleryUrls.length > 0;

  const minSwipeDistance = 50;

  const handleChangeImage = (newImageUrl: string, newIndex: number) => {
    if (newImageUrl === displayedImage || animation) return;

    const currentIndex = allGalleryUrls.findIndex(
      (url) => url === displayedImage
    );

    const largeImageUrl = allGalleryUrls[newIndex] || newImageUrl;
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
    handleChangeImage(allGalleryUrls[nextIndex], nextIndex);
  };

  const goToPrevImage = () => {
    if (!hasGallery) return;
    const currentIndex = allGalleryUrls.findIndex(
      (url) => url === displayedImage
    );
    if (currentIndex === -1) return;
    const prevIndex =
      (currentIndex - 1 + allGalleryUrls.length) % allGalleryUrls.length;
    handleChangeImage(allGalleryUrls[prevIndex], prevIndex);
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

  return (
    <>
      <section className="space-y-4 rounded-lg bg-zinc-900 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 lg:gap-5">
          {/* Cột mới: Tech Doc Thumbnails (luôn hiển thị) */}
          {technical_docs.length > 0 && (
            <div className="flex flex-col items-center space-y-2">
              {technical_docs.map((doc) => {
                let thumbnailUrl = doc.thumbnail_url;
                if (!thumbnailUrl) {
                  switch (doc.doc_type) {
                    case 'step_model':
                      thumbnailUrl =
                        'https://cdn.aiotautotech.com/images/step-file-icon-thumb.jpg';
                      break;
                    case 'datasheet':
                    case 'user_manual':
                      thumbnailUrl =
                        'https://cdn.aiotautotech.com/images/pdf-icon-thumb.webp';
                      break;
                    case 'schematic':
                      thumbnailUrl =
                        'https://cdn.aiotautotech.com/images/schematic-icon-thumb.webp';
                      break;
                    case 'github_repo':
                      thumbnailUrl =
                        'https://cdn.aiotautotech.com/images/code-icon-thumb.webp';
                      break;
                    default:
                      break;
                  }
                }

                const handleClick = (e: React.MouseEvent) => {
                  if (doc.doc_type === 'stl_files') {
                    e.preventDefault();
                    setViewingStlInModal(doc);
                  }
                  // Các loại khác sẽ tự động mở link mới do dùng thẻ <a>
                };

                const commonClasses =
                  'h-10 w-10 flex-shrink-0 rounded-md border border-gray-700 bg-gray-800 object-contain transition-all duration-200 hover:scale-105 hover:border-blue-400';

                if (!thumbnailUrl) return null;

                return (
                  <a
                    key={doc.id}
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={handleClick}
                    title={doc.title}
                    className="block"
                  >
                    <img
                      src={thumbnailUrl}
                      alt={doc.title}
                      className={commonClasses}
                    />
                  </a>
                );
              })}
            </div>
          )}

          {/* Cột trái: Ảnh & gallery */}
          <div className="flex flex-col">
            <div
              className="space-y-3"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <div
                className="group relative cursor-pointer overflow-hidden rounded-md border border-gray-800 bg-black/60"
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
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white opacity-100 transition-opacity hover:bg-black/50 lg:opacity-0 lg:group-hover:opacity-100"
                      aria-label="Ảnh trước"
                    >
                      <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={goToNextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white opacity-100 transition-opacity hover:bg-black/50 lg:opacity-0 lg:group-hover:opacity-100"
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
                      className="absolute right-2 top-2 rounded-full bg-black/30 p-1.5 text-white opacity-100 transition-opacity hover:bg-black/50 lg:opacity-0 lg:group-hover:opacity-100"
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
                      onClick={() => handleChangeImage(url, idx)}
                      className={`h-12 w-12 md:h-14 md:w-14 cursor-pointer overflow-hidden rounded-md bg-black/60 transition-all duration-200 ${
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
                    <span className="flex h-12 md:h-14 items-center justify-center rounded-md border border-dashed border-gray-700 bg-black/50 px-3 text-[11px] text-gray-400">
                      +{galleryUrls.length - 6} ảnh khác
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Phần thông tin và giá */}
        <div className="flex flex-col justify-between text-xs text-gray-300">
          <div className="space-y-3">
            {/* Mô tả ngắn */}
            {short_description && (
              <div
                className="prose prose-sm prose-invert max-w-none text-gray-300"
                dangerouslySetInnerHTML={{
                  __html: short_description,
                }}
              />
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

      {/* Modal để xem trước 3D (tái sử dụng từ ProductTechDocs) */}
      {viewingStlInModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setViewingStlInModal(null)}
        >
          <div
            className="relative flex h-[85vh] w-[90vw] max-w-4xl flex-col rounded-md bg-[#0f1015] shadow-2xl ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-800 p-4">
              <h3 className="font-semibold text-gray-200">
                {viewingStlInModal.title}
              </h3>
              <button
                type="button"
                onClick={() => setViewingStlInModal(null)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-700 hover:text-white"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="flex flex-1 items-center justify-center overflow-hidden p-2 sm:p-4">
              {viewingStlInModal.url && (
                <ModelViewer fileUrl={viewingStlInModal.url} />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
