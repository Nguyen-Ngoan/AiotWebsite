'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface MediaItem {
  type: 'image' | 'video';
  url: string;
  thumbUrl: string;
  alt: string;
}

interface ProjectMediaSliderProps {
  project: {
    title: string;
    video_url?: string | null;
    images?: {
      url: string;
      url_medium?: string | null;
      url_thumb?: string | null;
      alt?: string | null;
    }[];
  };
}

export const ProjectMediaSlider: React.FC<ProjectMediaSliderProps> = ({
  project,
}) => {
  const mediaItems: MediaItem[] = [];

  // Add video to the beginning of the list
  if (project.video_url) {
    const videoIdMatch = project.video_url.match(
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    if (videoId) {
      mediaItems.push({
        type: 'video',
        url: `https://www.youtube.com/embed/${videoId}`,
        thumbUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        alt: `Video for ${project.title}`,
      });
    }
  }

  // Add images
  if (project.images) {
    project.images.forEach((img) => {
      mediaItems.push({
        type: 'image',
        url: img.url,
        thumbUrl: img.url_thumb || img.url_medium || img.url,
        alt: img.alt || project.title,
      });
    });
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollTo = (index: number) => {
    if (sliderRef.current) {
      const slide = sliderRef.current.children[index] as HTMLElement;
      if (slide) {
        sliderRef.current.scrollTo({
          left: slide.offsetLeft,
          behavior: 'smooth',
        });
      }
    }
  };

  // Debounced scroll handler to update current index
  useEffect(() => {
    const slider = sliderRef.current;
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      if (slider) {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          const scrollLeft = slider.scrollLeft;
          const slideWidth = slider.clientWidth;
          const newIndex = Math.round(scrollLeft / slideWidth);
          if (newIndex !== currentIndex) {
            setCurrentIndex(newIndex);
          }
        }, 150);
      }
    };

    slider?.addEventListener('scroll', handleScroll);
    return () => slider?.removeEventListener('scroll', handleScroll);
  }, [currentIndex]);

  if (mediaItems.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      {/* CSS để ẩn thanh cuộn */}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>

      <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
        <div
          ref={sliderRef}
          className="no-scrollbar flex h-full w-full snap-x snap-mandatory scroll-smooth overflow-x-auto"
        >
          {mediaItems.map((item, index) => (
            <div
              key={index}
              className="h-full w-full flex-shrink-0 snap-center relative"
            >
              {item.type === 'video' ? (
                <iframe
                  src={item.url}
                  title={item.alt}
                  className="w-full h-full bg-black"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <Image
                  src={item.url}
                  alt={item.alt}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority={index === 0}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {mediaItems.length > 1 && (
        <div className="mt-4 flex justify-center">
          <div className="flex items-center gap-2">
            {mediaItems.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`h-2 w-2 rounded-full transition-colors ${
                  currentIndex === index
                    ? 'bg-blue-600'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
