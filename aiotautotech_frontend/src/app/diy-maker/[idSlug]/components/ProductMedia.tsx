// src/app/diy-maker/[idSlug]/components/ProductMedia.tsx

'use client';
import { useState, useEffect, useRef } from 'react';
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

export interface ProductMediaProps {
  mainImage?: string;
  galleryUrls?: string[];
  lightboxUrls?: string[];
  technical_docs?: TechnicalDoc[];
}

// Tải ModelViewer động
const ModelViewer = dynamic(() => import('./ModelViewer'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-[#111] rounded-lg flex items-center justify-center text-sm text-gray-400">
      Đang tải trình xem 3D...
    </div>
  ),
});

export function ProductMedia({
  mainImage,
  galleryUrls = [],
  lightboxUrls = [],
  technical_docs = [],
}: ProductMediaProps) {
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

  // Refs và state cho thumbnail scroller
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    setDisplayedImage(mainImage);
    setPreviousImage(undefined);
  }, [mainImage]);

  const allGalleryUrls = lightboxUrls.length > 0 ? lightboxUrls : galleryUrls;
  const hasGallery = allGalleryUrls.length > 0;

  const checkScrollability = () => {
    const el = scrollContainerRef.current;
    if (el) {
      const isScrollable = el.scrollWidth > el.clientWidth;
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(
        isScrollable && el.scrollLeft < el.scrollWidth - el.clientWidth - 1
      );
    }
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    checkScrollability();

    const resizeObserver = new ResizeObserver(() => {
      checkScrollability();
    });
    resizeObserver.observe(el);

    el.addEventListener('scroll', checkScrollability);

    return () => {
      resizeObserver.disconnect();
      el.removeEventListener('scroll', checkScrollability);
    };
  }, [galleryUrls]); // Re-check khi gallery thay đổi

  const handleThumbScroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (el) {
      const scrollAmount = el.clientWidth * 0.8; // Cuộn 80% chiều rộng nhìn thấy
      el.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };
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

  const goToNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!hasGallery) return;
    const currentIndex = allGalleryUrls.findIndex(
      (url) => url === displayedImage
    );
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % allGalleryUrls.length;
    handleChangeImage(allGalleryUrls[nextIndex]);
  };

  const goToPrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
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

  return (
    <>
      <section className="grid grid-cols-[auto_1fr] gap-3 lg:gap-5">
        {/* Cột: Tech Doc Thumbnails */}
        {technical_docs.length > 0 && (
          <div className="flex flex-shrink-0 flex-col items-center space-y-2">
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
              };

              const commonClasses =
                'h-12 w-12 flex-shrink-0 rounded-md border border-gray-700 bg-gray-800 object-contain transition-all duration-200 hover:scale-105 hover:border-blue-400';

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

        {/* Cột: Ảnh & gallery */}
        <div
          className="min-w-0 space-y-3 pt-2 lg:pt-0"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div
            className="group relative cursor-pointer overflow-hidden rounded-xl border border-gray-800 bg-black/60"
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

          {/* Gallery thumbnails với thanh cuộn ngang */}
          {hasGallery && (
            <div className="relative flex items-center">
              {canScrollLeft && (
                <button
                  type="button"
                  onClick={() => handleThumbScroll('left')}
                  className="absolute -left-3 z-10 rounded-full bg-gray-800/80 p-1 text-white shadow-md backdrop-blur-sm hover:bg-gray-700"
                  aria-label="Cuộn thumbnail sang trái"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
              )}
              <div
                ref={scrollContainerRef}
                className="flex w-full snap-x snap-mandatory-x items-center gap-2 overflow-x-auto scroll-smooth pb-2 scrollbar-hide"
              >
                {galleryUrls.map((url, idx) => (
                  <div
                    key={`${url}-${idx}`}
                    onClick={() => handleChangeImage(url)}
                    className={`h-14 w-14 flex-shrink-0 snap-start cursor-pointer overflow-hidden rounded-lg bg-black/60 transition-all duration-200 ${
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
              </div>
              {canScrollRight && (
                <button
                  type="button"
                  onClick={() => handleThumbScroll('right')}
                  className="absolute -right-3 z-10 rounded-full bg-gray-800/80 p-1 text-white shadow-md backdrop-blur-sm hover:bg-gray-700"
                  aria-label="Cuộn thumbnail sang phải"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      <Lightbox
        open={openLightbox}
        close={() => setOpenLightbox(false)}
        slides={allGalleryUrls.map((url) => ({ src: url }))}
        index={allGalleryUrls.findIndex((url) => url === displayedImage)}
        plugins={[Zoom]}
        zoom={{ maxZoomPixelRatio: 3 }}
        styles={{ container: { backgroundColor: 'rgba(0, 0, 0, .85)' } }}
      />

      {viewingStlInModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setViewingStlInModal(null)}
        >
          <div
            className="relative flex h-[85vh] w-[90vw] max-w-4xl flex-col rounded-lg bg-[#0f1015] shadow-2xl ring-1 ring-white/10"
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
