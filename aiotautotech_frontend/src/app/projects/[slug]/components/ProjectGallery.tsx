import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface ProjectGalleryProps {
  project: {
    slug: string;
    title: string;
    images?: {
      id: string | number;
      url_medium?: string | null;
      url: string;
      alt?: string | null;
    }[];
  };
  isAdmin: boolean;
}

export const ProjectGallery: React.FC<ProjectGalleryProps> = ({
  project,
  isAdmin,
}) => {
  return (
    <section id="gallery" className="mb-10 scroll-mt-20">
      <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span className="text-gray-400 font-mono">3.</span> THƯ VIỆN ẢNH
        {isAdmin && (
          <Link
            href={`/admin/projects/${project.slug}/images`}
            className="ml-2 text-xs font-mono font-normal text-gray-300 hover:text-blue-600"
          >
            [Edit]
          </Link>
        )}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {project.images?.map((img, idx) => (
          <div
            key={img.id || idx}
            className="group relative aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200"
          >
            <Image
              src={img.url_medium || img.url}
              alt={img.alt || project.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ))}
      </div>
    </section>
  );
};
