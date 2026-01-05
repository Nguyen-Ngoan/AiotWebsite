'use client';

import React, { useState, useEffect } from 'react';
import {
  CreateProjectData,
  projectService,
  Project,
} from '@/lib/api/projectService';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/20/solid';

// Custom hook để trì hoãn việc thực thi (debouncing)
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

interface ProjectFormProps {
  onSubmit: (data: CreateProjectData) => Promise<void>;
  isSubmitting?: boolean;
  initialData?: Partial<Project>; // Cho phép truyền cả `id` khi edit
  submitLabel?: string;
}

export default function ProjectForm({
  onSubmit,
  isSubmitting = false,
  initialData,
  submitLabel = 'Tạo dự án',
}: ProjectFormProps) {
  const [formData, setFormData] = useState<CreateProjectData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    video_url: initialData?.video_url || '',
    slug: initialData?.slug || '',
    tags: initialData?.tags || [],
    complexity_mechanical: initialData?.complexity_mechanical || 1,
    complexity_electrical: initialData?.complexity_electrical || 1,
    complexity_software: initialData?.complexity_software || 1,
    estimated_hours: initialData?.estimated_hours || 0,
    required_skills: initialData?.required_skills || [],
    version: initialData?.version || 'v1.0',
    status: initialData?.status || 'PROTOTYPE',
    problem_statement: initialData?.problem_statement || '',
    solution_analysis: initialData?.solution_analysis || '',
    block_diagram_url: initialData?.block_diagram_url || '',
  });
  const [tagInput, setTagInput] = useState('');
  const [skillInput, setSkillInput] = useState('');

  // State cho việc kiểm tra slug
  const [slugStatus, setSlugStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken' | 'error'
  >('idle');
  const [slugMessage, setSlugMessage] = useState<string | null>(null);
  const debouncedSlug = useDebounce(formData.slug, 500); // Trì hoãn 500ms

  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    const intFields = [
      'complexity_mechanical',
      'complexity_electrical',
      'complexity_software',
      'estimated_hours',
    ];

    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: intFields.includes(name) ? parseInt(value) || 0 : value,
      };
      if (name === 'title' && !initialData) {
        newData.slug = slugify(value);
      }
      return newData;
    });
  };

  // Effect để kiểm tra slug mỗi khi `debouncedSlug` thay đổi
  useEffect(() => {
    if (!debouncedSlug) {
      setSlugStatus('idle');
      setSlugMessage(null);
      return;
    }

    // Nếu đang edit và slug không đổi, không cần kiểm tra
    if (initialData && debouncedSlug === initialData.slug) {
      setSlugStatus('idle');
      setSlugMessage(null);
      return;
    }

    const checkSlug = async () => {
      setSlugStatus('checking');
      try {
        const res = await projectService.checkSlug({
          slug: debouncedSlug,
          exclude_id: initialData?.id,
        });
        setSlugStatus(res.available ? 'available' : 'taken');
        setSlugMessage(res.message || (res.available ? 'Slug hợp lệ.' : ''));
      } catch (error: any) {
        setSlugStatus('error');
        setSlugMessage('Không thể kiểm tra slug.');
      }
    };

    checkSlug();
  }, [debouncedSlug, initialData]);

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !formData.tags?.includes(newTag)) {
        setFormData((prev) => ({
          ...prev,
          tags: [...(prev.tags || []), newTag],
        }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newSkill = skillInput.trim();
      if (newSkill && !formData.required_skills?.includes(newSkill)) {
        setFormData((prev) => ({
          ...prev,
          required_skills: [...(prev.required_skills || []), newSkill],
        }));
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      required_skills: prev.required_skills?.filter((s) => s !== skillToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const isSlugInvalid = slugStatus === 'taken' || slugStatus === 'checking';

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white p-6 rounded-lg shadow"
    >
      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Tên dự án
        </label>
        <input
          type="text"
          name="title"
          id="title"
          required
          value={formData.title}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
          // placeholder="Ví dụ: Cánh tay robot 4 bậc tự do"
        />
      </div>

      {/* Slug */}
      <div>
        <label
          htmlFor="slug"
          className="block text-sm font-medium text-gray-700"
        >
          Slug
        </label>
        <div className="relative mt-1">
          <input
            type="text"
            name="slug"
            id="slug"
            value={formData.slug}
            onChange={handleChange}
            // placeholder="canh-tay-robot-4-bac-tu-do"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 pr-10"
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            {slugStatus === 'checking' && (
              <svg
                className="animate-spin h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {slugStatus === 'available' && (
              <CheckCircleIcon
                className="h-5 w-5 text-green-500"
                aria-hidden="true"
              />
            )}
            {slugStatus === 'taken' && (
              <XCircleIcon
                className="h-5 w-5 text-red-500"
                aria-hidden="true"
              />
            )}
            {slugStatus === 'error' && (
              <ExclamationCircleIcon
                className="h-5 w-5 text-yellow-500"
                aria-hidden="true"
              />
            )}
          </div>
        </div>
        {slugMessage && (
          <p
            className={`mt-2 text-sm ${
              slugStatus === 'taken'
                ? 'text-red-600'
                : slugStatus === 'available'
                ? 'text-green-600'
                : 'text-gray-500'
            }`}
          >
            {slugMessage}
          </p>
        )}
      </div>

      {/* Version & Status */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="version"
            className="block text-sm font-medium text-gray-700"
          >
            Phiên bản (Version)
          </label>
          <input
            type="text"
            name="version"
            id="version"
            value={formData.version}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            placeholder="v1.0"
          />
        </div>

        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700"
          >
            Trạng thái
          </label>
          <select
            name="status"
            id="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
          >
            <option value="CONCEPT">Concept (Ý tưởng)</option>
            <option value="PROTOTYPE">Prototype (Mẫu thử)</option>
            <option value="STABLE">Stable (Ổn định)</option>
            <option value="DEPRECATED">Deprecated (Ngưng hỗ trợ)</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Mô tả ngắn
        </label>
        <textarea
          name="description"
          id="description"
          rows={4}
          required
          value={formData.description}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
          placeholder="Mô tả tổng quan về dự án..."
        />
      </div>

      {/* Problem Statement */}
      <div>
        <label
          htmlFor="problem_statement"
          className="block text-sm font-medium text-gray-700"
        >
          Vấn đề / Bài toán (Problem Statement)
        </label>
        <textarea
          name="problem_statement"
          id="problem_statement"
          rows={3}
          value={formData.problem_statement}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
          placeholder="Mô tả vấn đề cần giải quyết..."
        />
      </div>

      {/* Solution Analysis */}
      <div>
        <label
          htmlFor="solution_analysis"
          className="block text-sm font-medium text-gray-700"
        >
          Phân tích giải pháp (Markdown)
        </label>
        <textarea
          name="solution_analysis"
          id="solution_analysis"
          rows={6}
          value={formData.solution_analysis}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 font-mono"
          placeholder="Phân tích kỹ thuật, lý do chọn linh kiện..."
        />
      </div>

      {/* URLs */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="video_url"
            className="block text-sm font-medium text-gray-700"
          >
            Video URL (YouTube)
          </label>
          <input
            type="url"
            name="video_url"
            id="video_url"
            value={formData.video_url}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            placeholder="https://youtube.com/..."
          />
        </div>

        <div>
          <label
            htmlFor="block_diagram_url"
            className="block text-sm font-medium text-gray-700"
          >
            Block Diagram URL
          </label>
          <input
            type="url"
            name="block_diagram_url"
            id="block_diagram_url"
            value={formData.block_diagram_url}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            placeholder="https://..."
          />
        </div>
      </div>

      {/* Complexity & Estimated Hours */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label
            htmlFor="complexity_mechanical"
            className="block text-sm font-medium text-gray-700"
          >
            Cơ khí (1-3)
          </label>
          <select
            name="complexity_mechanical"
            id="complexity_mechanical"
            value={formData.complexity_mechanical}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
          >
            <option value={1}>1 - Dễ</option>
            <option value={2}>2 - Trung bình</option>
            <option value={3}>3 - Khó</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="complexity_electrical"
            className="block text-sm font-medium text-gray-700"
          >
            Điện tử (1-3)
          </label>
          <select
            name="complexity_electrical"
            id="complexity_electrical"
            value={formData.complexity_electrical}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
          >
            <option value={1}>1 - Dễ</option>
            <option value={2}>2 - Trung bình</option>
            <option value={3}>3 - Khó</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="complexity_software"
            className="block text-sm font-medium text-gray-700"
          >
            Phần mềm (1-3)
          </label>
          <select
            name="complexity_software"
            id="complexity_software"
            value={formData.complexity_software}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
          >
            <option value={1}>1 - Dễ</option>
            <option value={2}>2 - Trung bình</option>
            <option value={3}>3 - Khó</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="estimated_hours"
            className="block text-sm font-medium text-gray-700"
          >
            Thời gian (giờ)
          </label>
          <input
            type="number"
            name="estimated_hours"
            id="estimated_hours"
            min="0"
            value={formData.estimated_hours}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
          />
        </div>
      </div>

      {/* Required Skills */}
      <div>
        <label
          htmlFor="required_skills"
          className="block text-sm font-medium text-gray-700"
        >
          Kỹ năng yêu cầu
        </label>
        <div className="mt-1 flex flex-wrap gap-2 border rounded-md p-2 border-gray-300 bg-white">
          {formData.required_skills?.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="ml-1 text-green-600 hover:text-green-800 font-bold"
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleSkillKeyDown}
            placeholder="Nhập kỹ năng (VD: Hàn mạch, Python)..."
            className="flex-1 outline-none min-w-[120px] text-sm"
          />
        </div>
      </div>

      {/* Tags */}
      <div>
        <label
          htmlFor="tags"
          className="block text-sm font-medium text-gray-700"
        >
          Tags
        </label>
        <div className="mt-1 flex flex-wrap gap-2 border rounded-md p-2 border-gray-300 bg-white">
          {formData.tags?.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 text-blue-600 hover:text-blue-800 font-bold"
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="Nhập tag và nhấn Enter..."
            className="flex-1 outline-none min-w-[120px] text-sm"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Nhấn Enter hoặc dấu phẩy để thêm tag.
        </p>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={isSubmitting || isSlugInvalid}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Đang lưu...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
