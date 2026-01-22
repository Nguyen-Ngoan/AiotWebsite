'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  CpuChipIcon,
  CommandLineIcon,
} from '@heroicons/react/24/outline';
import {
  projectService,
  type CreatePlaybookData,
  type PromptItem,
  type PromptPlaybook,
} from '@/lib/api/projectService';

interface ProjectAIPlaybooksProps {
  projectId: string;
  playbooks: PromptPlaybook[];
  isAdmin?: boolean;
  manageHref?: string;
}

export const ProjectAIPlaybooks: React.FC<ProjectAIPlaybooksProps> = ({
  playbooks,
  isAdmin = false,
  projectId,
  manageHref,
}) => {
  const [expandedPlaybook, setExpandedPlaybook] = useState<string | null>(null);
  const [playbooksState, setPlaybooksState] =
    useState<PromptPlaybook[]>(playbooks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPlaybookId, setModalPlaybookId] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSavingPrompt, setIsSavingPrompt] = useState(false);
  const [newPrompt, setNewPrompt] = useState<{
    stage: PromptItem['stage'];
    title: string;
    content: string;
    variablesText: string;
    include_project_context: boolean;
  }>({
    stage: 'CONCEPT',
    title: '',
    content: '',
    variablesText: '',
    include_project_context: true,
  });

  useEffect(() => {
    setPlaybooksState(playbooks);
  }, [playbooks]);

  const openPromptModal = (playbookId: string) => {
    setModalPlaybookId(playbookId);
    setNewPrompt({
      stage: 'CONCEPT',
      title: '',
      content: '',
      variablesText: '',
      include_project_context: true,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const closePromptModal = () => {
    if (isSavingPrompt) return;
    setIsModalOpen(false);
    setModalPlaybookId(null);
    setModalError(null);
  };

  const parseVariables = (text: string) =>
    text
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

  const handleCreatePrompt = async () => {
    if (!modalPlaybookId) return;
    const playbook = playbooksState.find((pb) => pb.id === modalPlaybookId);
    if (!playbook) return;

    const trimmedTitle = newPrompt.title.trim();
    const trimmedContent = newPrompt.content.trim();

    if (!trimmedTitle || !trimmedContent) {
      setModalError('Prompt cần có tiêu đề và nội dung.');
      return;
    }

    const payload: CreatePlaybookData = {
      topic_name: playbook.topic_name,
      domain: playbook.domain,
      prompts: [
        ...(playbook.prompts || []),
        {
          stage: newPrompt.stage,
          title: trimmedTitle,
          content: trimmedContent,
          variables: parseVariables(newPrompt.variablesText),
          include_project_context: newPrompt.include_project_context,
        },
      ],
    };

    setIsSavingPrompt(true);
    setModalError(null);
    try {
      const updated = await projectService.updatePlaybook(
        projectId,
        playbook.id,
        payload
      );
      setPlaybooksState((prev) =>
        prev.map((pb) => (pb.id === updated.id ? updated : pb))
      );
      closePromptModal();
    } catch (err: any) {
      setModalError(err.message || 'Không thể thêm prompt.');
    } finally {
      setIsSavingPrompt(false);
    }
  };

  if (!playbooksState || playbooksState.length === 0) {
    if (!isAdmin) return null;
    return (
      <section
        id="ai-assistant"
        className="mt-12 scroll-mt-20 border-t border-gray-100 pt-12"
      >
        <div className="flex items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CpuChipIcon className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              AI Engineering Assistant
            </h2>
          </div>
          {manageHref && (
            <a
              href={manageHref}
              className="inline-flex items-center rounded-md border border-purple-200 bg-purple-50 px-3 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-100"
            >
              Quản lý prompt
            </a>
          )}
        </div>
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
          Chưa có prompt nào. Hãy thêm playbook/prompt để hiển thị ở đây.
        </div>
      </section>
    );
  }

  return (
    <section
      id="ai-assistant"
      className="mt-12 scroll-mt-20 border-t border-gray-100 pt-12"
    >
      <div className="flex items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-100 rounded-lg">
            <CpuChipIcon className="h-5 w-5 text-purple-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            AI Engineering Assistant
          </h2>
        </div>
        {isAdmin && manageHref && (
          <a
            href={manageHref}
            className="inline-flex items-center rounded-md border border-purple-200 bg-purple-50 px-3 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-100"
          >
            Quản lý prompt
          </a>
        )}
      </div>

      <div className="space-y-4">
        {playbooksState.map((playbook) => (
          <div
            key={playbook.id}
            className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between gap-3 p-4 bg-gray-50/50">
              <button
                onClick={() =>
                  setExpandedPlaybook(
                    expandedPlaybook === playbook.id ? null : playbook.id
                  )
                }
                className="flex items-center gap-3 text-left"
              >
                <DomainBadge domain={playbook.domain} />
                <span className="font-semibold text-gray-800">
                  {playbook.topic_name}
                </span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setExpandedPlaybook(
                    expandedPlaybook === playbook.id ? null : playbook.id
                  )
                }
                className="inline-flex items-center rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                {expandedPlaybook === playbook.id ? (
                  <ChevronUpIcon className="h-4 w-4" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4" />
                )}
              </button>
            </div>

            {expandedPlaybook === playbook.id && (
              <div className="p-4 border-t border-gray-100">
                <PlaybookContent prompts={playbook.prompts} />
                {isAdmin && (
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => openPromptModal(playbook.id)}
                      className="inline-flex items-center rounded-md border border-purple-200 bg-white px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-50"
                    >
                      Thêm prompt
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {isAdmin && isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-3xl rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Tạo prompt mới
              </h3>
              <button
                type="button"
                onClick={closePromptModal}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Đóng
              </button>
            </div>
            <div className="max-h-[75vh] overflow-y-auto px-6 py-4 space-y-4">
              {modalError && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {modalError}
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Stage
                  </label>
                  <select
                    value={newPrompt.stage}
                    onChange={(e) =>
                      setNewPrompt((prev) => ({
                        ...prev,
                        stage: e.target.value as PromptItem['stage'],
                      }))
                    }
                    className="w-full rounded-md border-gray-300 p-2 text-sm shadow-sm"
                  >
                    {['CONCEPT', 'UNIT_TEST', 'INTEGRATION', 'DEBUG'].map(
                      (stage) => (
                        <option key={stage} value={stage}>
                          {stage}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newPrompt.title}
                    onChange={(e) =>
                      setNewPrompt((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border-gray-300 p-2 text-sm shadow-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Content
                </label>
                <textarea
                  rows={6}
                  value={newPrompt.content}
                  onChange={(e) =>
                    setNewPrompt((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border-gray-300 p-2 text-sm shadow-sm"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Variables (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newPrompt.variablesText}
                    onChange={(e) =>
                      setNewPrompt((prev) => ({
                        ...prev,
                        variablesText: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border-gray-300 p-2 text-sm shadow-sm"
                  />
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <input
                    type="checkbox"
                    checked={newPrompt.include_project_context}
                    onChange={(e) =>
                      setNewPrompt((prev) => ({
                        ...prev,
                        include_project_context: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">
                    Include project context
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                type="button"
                onClick={closePromptModal}
                className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Huỷ
              </button>
              <button
                type="button"
                onClick={handleCreatePrompt}
                disabled={isSavingPrompt}
                className="rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-60"
              >
                {isSavingPrompt ? 'Đang lưu...' : 'Tạo prompt'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const DomainBadge = ({ domain }: { domain: PromptPlaybook['domain'] }) => {
  const styles = {
    FIRMWARE: 'bg-blue-100 text-blue-700 border-blue-200',
    BACKEND: 'bg-green-100 text-green-700 border-green-200',
    MECHANICAL: 'bg-orange-100 text-orange-700 border-orange-200',
  };
  return (
    <span
      className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-tight ${styles[domain]}`}
    >
      {domain}
    </span>
  );
};

const PlaybookContent = ({ prompts }: { prompts: PromptItem[] }) => {
  const stages = ['CONCEPT', 'UNIT_TEST', 'INTEGRATION', 'DEBUG'] as const;
  const availableStages = stages.filter((s) =>
    prompts.some((p) => p.stage === s)
  );
  const [activeStage, setActiveStage] = useState(availableStages[0]);

  const currentPrompt = prompts.find((p) => p.stage === activeStage);

  if (!currentPrompt) return null;

  return (
    <div>
      <div className="flex gap-2 mb-6 border-b border-gray-100 pb-2 overflow-x-auto">
        {availableStages.map((stage) => (
          <button
            key={stage}
            onClick={() => setActiveStage(stage)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeStage === stage
                ? 'bg-purple-600 text-white'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {stage.replace('_', ' ')}
          </button>
        ))}
      </div>

      <PromptViewer prompt={currentPrompt} />
    </div>
  );
};

const PromptViewer = ({ prompt }: { prompt: PromptItem }) => {
  const [varValues, setVarValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  const renderedContent = useMemo(() => {
    let text = prompt.content;
    prompt.variables?.forEach((v) => {
      const val = varValues[v] || `{{${v}}}`;
      text = text.replace(new RegExp(`{{${v}}}`, 'g'), val);
    });
    return text;
  }, [prompt.content, prompt.variables, varValues]);

  const handleCopy = () => {
    navigator.clipboard.writeText(renderedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
        <CommandLineIcon className="h-4 w-4" />
        {prompt.title}
      </h4>

      {prompt.variables && prompt.variables.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
          {prompt.variables.map((v) => (
            <div key={v}>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                {v}
              </label>
              <input
                type="text"
                placeholder={`Enter ${v}...`}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-purple-500 outline-none"
                value={varValues[v] || ''}
                onChange={(e) =>
                  setVarValues({ ...varValues, [v]: e.target.value })
                }
              />
            </div>
          ))}
        </div>
      )}

      <div className="relative group">
        <button
          onClick={handleCopy}
          className="absolute right-2 top-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-md border border-gray-700 transition-all text-white z-10"
          title="Copy to clipboard"
        >
          {copied ? (
            <CheckIcon className="h-4 w-4 text-green-400" />
          ) : (
            <ClipboardDocumentIcon className="h-4 w-4" />
          )}
        </button>
        <pre className="bg-gray-900 text-gray-100 p-4 pt-10 rounded-lg text-sm font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed border border-gray-800 shadow-inner">
          {renderedContent}
        </pre>
      </div>
    </div>
  );
};
