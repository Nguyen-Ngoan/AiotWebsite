'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { StepWithId } from './StepsManager';

interface SortableStepItemProps {
  step: StepWithId;
  onUpdate: (step: StepWithId) => void;
  onDelete: (clientId: string) => void;
}

export const SortableStepItem: React.FC<SortableStepItemProps> = ({
  step,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedStep, setEditedStep] = useState(step);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: step.clientId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = () => {
    onUpdate(editedStep);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedStep(step);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style} className="p-4 bg-slate-800">
        <div className="space-y-3">
          <input
            type="text"
            value={editedStep.title}
            onChange={(e) =>
              setEditedStep({ ...editedStep, title: e.target.value })
            }
            className="w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <textarea
            value={editedStep.content}
            onChange={(e) =>
              setEditedStep({ ...editedStep, content: e.target.value })
            }
            rows={5}
            className="w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="URL hình ảnh (tùy chọn)"
            value={editedStep.image_url || ''}
            onChange={(e) =>
              setEditedStep({ ...editedStep, image_url: e.target.value })
            }
            className="w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-gray-100 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Lưu
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1 text-sm bg-slate-600 text-slate-200 rounded-md hover:bg-slate-500"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className="p-4 flex items-start gap-4">
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none p-2 text-gray-400 hover:text-gray-700"
        aria-label="Drag to reorder"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      <div className="flex-1">
        <p className="font-bold text-gray-900">{step.title}</p>
        <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
          {step.content}
        </p>
        {step.image_url && (
          <img
            src={step.image_url}
            alt={step.title}
            className="mt-2 max-h-24 rounded border"
          />
        )}
      </div>
      <div className="flex-shrink-0 flex gap-2">
        <button
          onClick={() => setIsEditing(true)}
          className="text-sm text-blue-600 hover:underline"
        >
          Sửa
        </button>
        <button
          onClick={() => {
            if (window.confirm('Bạn có chắc muốn xóa bước này?')) {
              onDelete(step.clientId);
            }
          }}
          className="text-sm text-red-600 hover:underline"
        >
          Xóa
        </button>
      </div>
    </div>
  );
};
