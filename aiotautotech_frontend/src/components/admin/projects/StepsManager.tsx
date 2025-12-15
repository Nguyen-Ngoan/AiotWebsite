'use client';

import React, { useState, useEffect } from 'react';
import { Project, projectService } from '@/lib/api/projectService';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { v4 as uuidv4 } from 'uuid';
import { SortableStepItem } from './SortableStepItem';

type Step = {
  order: number;
  title: string;
  content: string;
  image_url?: string | null;
};

export type StepWithId = Step & { clientId: string };

interface StepsManagerProps {
  project: Project;
  onUpdate: () => void;
}

const StepsManager: React.FC<StepsManagerProps> = ({ project, onUpdate }) => {
  const [steps, setSteps] = useState<StepWithId[]>([]);
  const [newStep, setNewStep] = useState({ title: '', content: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const sortedSteps = project.steps
      ? [...project.steps].sort((a, b) => a.order - b.order)
      : [];
    setSteps(
      sortedSteps.map((s, index) => ({
        ...s,
        order: index,
        clientId: uuidv4(),
      }))
    );
  }, [project]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSteps((items) => {
        const oldIndex = items.findIndex((item) => item.clientId === active.id);
        const newIndex = items.findIndex((item) => item.clientId === over.id);
        const reorderedItems = arrayMove(items, oldIndex, newIndex);
        return reorderedItems.map((item, index) => ({ ...item, order: index }));
      });
    }
  };

  const handleAddStep = () => {
    if (!newStep.title.trim()) {
      alert('Tiêu đề bước không được để trống.');
      return;
    }
    const stepToAdd: StepWithId = {
      ...newStep,
      order: steps.length,
      clientId: uuidv4(),
    };
    setSteps([...steps, stepToAdd]);
    setNewStep({ title: '', content: '' });
  };

  const handleUpdateStep = (updatedStep: StepWithId) => {
    setSteps(
      steps.map((step) =>
        step.clientId === updatedStep.clientId ? updatedStep : step
      )
    );
  };

  const handleDeleteStep = (clientIdToDelete: string) => {
    setSteps(
      steps
        .filter((step) => step.clientId !== clientIdToDelete)
        .map((step, index) => ({ ...step, order: index }))
    );
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await projectService.updateProjectSteps(project.id, steps);
      alert('Cập nhật các bước thành công!');
      onUpdate();
    } catch (error) {
      console.error('Failed to save steps:', error);
      alert('Có lỗi xảy ra khi lưu các bước.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium">Các bước thực hiện</h3>
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={steps.map((s) => s.clientId)}
            strategy={verticalListSortingStrategy}
          >
            <div className="divide-y divide-gray-200">
              {steps.map((step) => (
                <SortableStepItem
                  key={step.clientId}
                  step={step}
                  onUpdate={handleUpdateStep}
                  onDelete={handleDeleteStep}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
        <h3 className="text-lg font-medium mb-4 text-gray-100">
          Thêm bước mới
        </h3>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Tiêu đề bước"
            value={newStep.title}
            onChange={(e) => setNewStep({ ...newStep, title: e.target.value })}
            className="w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-gray-100 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <textarea
            placeholder="Nội dung chi tiết"
            value={newStep.content}
            onChange={(e) =>
              setNewStep({ ...newStep, content: e.target.value })
            }
            rows={4}
            className="w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-gray-100 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <button
            onClick={handleAddStep}
            disabled={!newStep.title.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-800/50 disabled:cursor-not-allowed"
          >
            Thêm bước
          </button>
        </div>
      </div>

      <div>
        <button
          onClick={handleSaveChanges}
          disabled={isSaving}
          className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-gray-400"
        >
          {isSaving ? 'Đang lưu...' : 'Lưu tất cả thay đổi'}
        </button>
      </div>
    </div>
  );
};

export default StepsManager;
