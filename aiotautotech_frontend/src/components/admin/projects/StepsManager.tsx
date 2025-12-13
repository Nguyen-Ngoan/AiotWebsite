'use client';

import React, { useState } from 'react';
import {
  Project,
  projectService,
  InstructionStep,
} from '@/lib/api/projectService';

interface StepsManagerProps {
  project: Project;
  onUpdate: () => void;
}

export default function StepsManager({ project, onUpdate }: StepsManagerProps) {
  // Tự động tính order tiếp theo
  const getNextOrder = () => {
    if (!project.steps || project.steps.length === 0) return 1;
    const maxOrder = Math.max(...project.steps.map((s) => s.order));
    return maxOrder + 1;
  };

  const [formData, setFormData] = useState({
    order: getNextOrder(),
    title: '',
    content: '',
    image_url: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await projectService.addInstructionStep(project.id, {
        order: formData.order,
        title: formData.title,
        content: formData.content,
        image_url: formData.image_url,
      });

      // Reset form & update list
      onUpdate();
      setFormData({
        order: formData.order + 1, // Tự tăng order cho bước tiếp theo
        title: '',
        content: '',
        image_url: '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to add step');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sắp xếp steps theo order
  const sortedSteps = [...(project.steps || [])].sort(
    (a, b) => a.order - b.order
  );

  return (
    <div className="space-y-8">
      {/* Form Thêm Bước */}
      <div className="bg-white shadow sm:rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
          Thêm bước hướng dẫn
        </h3>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* Order */}
            <div className="sm:col-span-1">
              <label
                htmlFor="order"
                className="block text-sm font-medium text-gray-700"
              >
                Thứ tự
              </label>
              <input
                type="number"
                name="order"
                id="order"
                required
                value={formData.order}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              />
            </div>

            {/* Title */}
            <div className="sm:col-span-5">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Tiêu đề bước
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="Ví dụ: Chuẩn bị linh kiện"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              />
            </div>

            {/* Image URL */}
            <div className="sm:col-span-6">
              <label
                htmlFor="image_url"
                className="block text-sm font-medium text-gray-700"
              >
                URL Hình ảnh (Tùy chọn)
              </label>
              <input
                type="url"
                name="image_url"
                id="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="https://..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              />
            </div>

            {/* Content */}
            <div className="sm:col-span-6">
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700"
              >
                Nội dung hướng dẫn
              </label>
              <textarea
                name="content"
                id="content"
                rows={4}
                required
                value={formData.content}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Đang lưu...' : 'Thêm bước'}
            </button>
          </div>
        </form>
      </div>

      {/* Danh sách Steps hiện tại */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Danh sách các bước ({sortedSteps.length})
        </h3>

        {sortedSteps.length === 0 ? (
          <div className="bg-white shadow sm:rounded-lg p-8 text-center text-gray-500 border border-gray-200">
            Chưa có hướng dẫn nào.
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
            <ul role="list" className="divide-y divide-gray-200">
              {sortedSteps.map((step, index) => (
                <li key={index} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 pt-1">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-800 font-bold text-sm">
                        {step.order}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-blue-600 truncate">
                        {step.title}
                      </p>
                      <p className="mt-1 text-sm text-gray-500 whitespace-pre-line">
                        {step.content}
                      </p>
                      {step.image_url && (
                        <div className="mt-2">
                          <img
                            src={step.image_url}
                            alt={step.title}
                            className="h-24 w-auto object-cover rounded border"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
