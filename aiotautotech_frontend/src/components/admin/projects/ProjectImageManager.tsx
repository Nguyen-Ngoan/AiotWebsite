'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Project,
  ProjectImage,
  projectService,
} from '@/lib/api/projectService';

interface ProjectImageManagerProps {
  project: Project;
  onUpdate: () => void;
}

export default function ProjectImageManager({
  project,
  onUpdate,
}: ProjectImageManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setUploading(true);
    setError(null);

    try {
      // Tự động tạo tên file SEO từ tên file gốc
      const seoName = file.name
        .split('.')[0]
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-');

      await projectService.uploadProjectImage(project.id, file, {
        seo_file_name: seoName,
        type: 'gallery',
        is_primary: false, // Mặc định không phải ảnh chính
        alt: project.title,
        title: project.title,
      });

      onUpdate(); // Refresh data
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi khi upload ảnh');
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const setPrimary = async (img: ProjectImage) => {
    if (!project.images) return;

    // 1. Cập nhật danh sách ảnh: Set isPrimary=true cho ảnh được chọn, false cho ảnh khác
    const newImages = project.images.map((i) => ({
      ...i,
      isPrimary: i.fileName === img.fileName,
    }));

    // 2. Lấy URL của ảnh mới để update thumbnail_url của Project
    const newThumbnail = img.url_thumb || img.url;

    try {
      // Gọi API update project
      await projectService.updateProject(project.slug, {
        ...project,
        images: newImages,
        thumbnail_url: newThumbnail,
      } as any);
      onUpdate();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Lỗi khi cập nhật ảnh đại diện.');
    }
  };

  const handleDelete = async (fileName: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa ảnh này không?')) return;
    try {
      await projectService.deleteProjectImage(project.id, fileName);
      onUpdate();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Lỗi khi xóa ảnh.');
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Upload Area */}
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              className="w-8 h-8 mb-4 text-gray-500"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 16"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG or WEBP (MAX. 800x400px)
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
            accept="image/*"
          />
        </label>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {project.images?.map((img, idx) => (
          <div
            key={img.id || idx}
            className="relative group border rounded-lg overflow-hidden bg-white shadow-sm"
          >
            <div className="aspect-video relative">
              <Image
                src={img.url_thumb || img.url}
                alt={img.alt || 'Project Image'}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 truncate">
                  {img.type}
                </span>
                {img.isPrimary && (
                  <span className="bg-green-100 text-green-800 text-[10px] px-1.5 py-0.5 rounded font-medium">
                    Primary
                  </span>
                )}
              </div>
              <div className="mt-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {!img.isPrimary && (
                  <button
                    onClick={() => setPrimary(img)}
                    className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 flex-1"
                  >
                    Set Primary
                  </button>
                )}
                <button
                  onClick={() => handleDelete(img.fileName)}
                  className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100"
                >
                  Del
                </button>
              </div>
            </div>
          </div>
        ))}
        {(!project.images || project.images.length === 0) && (
          <div className="col-span-full text-center py-8 text-gray-500 italic">
            Chưa có ảnh nào trong thư viện.
          </div>
        )}
      </div>
    </div>
  );
}
