'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  CreatePlaybookData,
  PromptItem,
  PromptPlaybook,
  projectService,
} from '@/lib/api/projectService';

type PromptFormState = {
  stage: PromptItem['stage'];
  title: string;
  content: string;
  variablesText: string;
  include_project_context: boolean;
};

const stageOptions: PromptItem['stage'][] = [
  'CONCEPT',
  'UNIT_TEST',
  'INTEGRATION',
  'DEBUG',
];

const domainOptions: PromptPlaybook['domain'][] = [
  'FIRMWARE',
  'BACKEND',
  'MECHANICAL',
];

const createPromptFormState = (prompt?: PromptItem): PromptFormState => ({
  stage: prompt?.stage || 'CONCEPT',
  title: prompt?.title || '',
  content: prompt?.content || '',
  variablesText: (prompt?.variables || []).join(', '),
  include_project_context: prompt?.include_project_context ?? true,
});

const parseVariables = (text: string) =>
  text
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const buildPromptItem = (form: PromptFormState): PromptItem => ({
  stage: form.stage,
  title: form.title.trim(),
  content: form.content.trim(),
  variables: parseVariables(form.variablesText),
  include_project_context: form.include_project_context,
});

interface PlaybookManagerProps {
  projectId: string;
}

export default function PlaybookManager({ projectId }: PlaybookManagerProps) {
  const [playbooks, setPlaybooks] = useState<PromptPlaybook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [newPlaybook, setNewPlaybook] = useState<CreatePlaybookData>({
    topic_name: '',
    domain: 'FIRMWARE',
    prompts: [],
  });

  const [editingPrompt, setEditingPrompt] = useState<{
    playbookId: string;
    index: number;
    form: PromptFormState;
  } | null>(null);

  const [newPromptForms, setNewPromptForms] = useState<
    Record<string, PromptFormState>
  >({});

  const [playbookEdits, setPlaybookEdits] = useState<
    Record<string, { topic_name: string; domain: PromptPlaybook['domain'] }>
  >({});

  const fetchPlaybooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectService.getPlaybooks(projectId);
      setPlaybooks(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách playbook.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchPlaybooks();
    }
  }, [projectId]);

  const getPlaybookEdit = (playbook: PromptPlaybook) => {
    return (
      playbookEdits[playbook.id] || {
        topic_name: playbook.topic_name,
        domain: playbook.domain,
      }
    );
  };

  const getNewPromptForm = (playbookId: string) => {
    return newPromptForms[playbookId] || createPromptFormState();
  };

  const updatePlaybookState = (updated: PromptPlaybook) => {
    setPlaybooks((prev) =>
      prev.map((pb) => (pb.id === updated.id ? updated : pb))
    );
  };

  const handleCreatePlaybook = async () => {
    if (!newPlaybook.topic_name.trim()) {
      setError('Vui lòng nhập topic cho playbook.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const created = await projectService.createPlaybook(projectId, newPlaybook);
      setPlaybooks((prev) => [created, ...prev]);
      setNewPlaybook({ topic_name: '', domain: 'FIRMWARE', prompts: [] });
    } catch (err: any) {
      setError(err.message || 'Không thể tạo playbook.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlaybook = async (playbookId: string) => {
    if (!window.confirm('Xoá playbook này?')) return;
    setSaving(true);
    setError(null);
    try {
      await projectService.deletePlaybook(projectId, playbookId);
      setPlaybooks((prev) => prev.filter((pb) => pb.id !== playbookId));
    } catch (err: any) {
      setError(err.message || 'Không thể xoá playbook.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePlaybookMeta = async (playbook: PromptPlaybook) => {
    const edit = getPlaybookEdit(playbook);
    const payload: CreatePlaybookData = {
      topic_name: edit.topic_name.trim(),
      domain: edit.domain,
      prompts: playbook.prompts || [],
    };
    setSaving(true);
    setError(null);
    try {
      const updated = await projectService.updatePlaybook(
        projectId,
        playbook.id,
        payload
      );
      updatePlaybookState(updated);
      setPlaybookEdits((prev) => {
        const next = { ...prev };
        delete next[playbook.id];
        return next;
      });
    } catch (err: any) {
      setError(err.message || 'Không thể cập nhật playbook.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddPrompt = async (playbook: PromptPlaybook) => {
    const form = getNewPromptForm(playbook.id);
    const newPrompt = buildPromptItem(form);
    if (!newPrompt.title || !newPrompt.content) {
      setError('Prompt cần có tiêu đề và nội dung.');
      return;
    }
    const payload: CreatePlaybookData = {
      topic_name: playbook.topic_name,
      domain: playbook.domain,
      prompts: [...(playbook.prompts || []), newPrompt],
    };
    setSaving(true);
    setError(null);
    try {
      const updated = await projectService.updatePlaybook(
        projectId,
        playbook.id,
        payload
      );
      updatePlaybookState(updated);
      setNewPromptForms((prev) => {
        const next = { ...prev };
        delete next[playbook.id];
        return next;
      });
    } catch (err: any) {
      setError(err.message || 'Không thể thêm prompt.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePrompt = async (playbook: PromptPlaybook, index: number) => {
    if (!window.confirm('Xoá prompt này?')) return;
    const updatedPrompts = (playbook.prompts || []).filter(
      (_, i) => i !== index
    );
    const payload: CreatePlaybookData = {
      topic_name: playbook.topic_name,
      domain: playbook.domain,
      prompts: updatedPrompts,
    };
    setSaving(true);
    setError(null);
    try {
      const updated = await projectService.updatePlaybook(
        projectId,
        playbook.id,
        payload
      );
      updatePlaybookState(updated);
    } catch (err: any) {
      setError(err.message || 'Không thể xoá prompt.');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePromptEdit = async () => {
    if (!editingPrompt) return;
    const { playbookId, index, form } = editingPrompt;
    const playbook = playbooks.find((pb) => pb.id === playbookId);
    if (!playbook) return;

    const updatedPrompt = buildPromptItem(form);
    if (!updatedPrompt.title || !updatedPrompt.content) {
      setError('Prompt cần có tiêu đề và nội dung.');
      return;
    }

    const updatedPrompts = [...(playbook.prompts || [])];
    updatedPrompts[index] = updatedPrompt;

    const payload: CreatePlaybookData = {
      topic_name: playbook.topic_name,
      domain: playbook.domain,
      prompts: updatedPrompts,
    };

    setSaving(true);
    setError(null);
    try {
      const updated = await projectService.updatePlaybook(
        projectId,
        playbookId,
        payload
      );
      updatePlaybookState(updated);
      setEditingPrompt(null);
    } catch (err: any) {
      setError(err.message || 'Không thể cập nhật prompt.');
    } finally {
      setSaving(false);
    }
  };

  const promptPreview = useMemo(() => {
    if (!editingPrompt) return '';
    return editingPrompt.form.content;
  }, [editingPrompt]);

  if (loading) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-gray-500">
        Đang tải playbooks...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tạo Playbook mới
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Topic
            </label>
            <input
              type="text"
              value={newPlaybook.topic_name}
              onChange={(e) =>
                setNewPlaybook((prev) => ({
                  ...prev,
                  topic_name: e.target.value,
                }))
              }
              className="w-full rounded-md border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Ví dụ: Modbus RTU Integration"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Domain
            </label>
            <select
              value={newPlaybook.domain}
              onChange={(e) =>
                setNewPlaybook((prev) => ({
                  ...prev,
                  domain: e.target.value as PromptPlaybook['domain'],
                }))
              }
              className="w-full rounded-md border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {domainOptions.map((domain) => (
                <option key={domain} value={domain}>
                  {domain}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <button
            type="button"
            onClick={handleCreatePlaybook}
            disabled={saving}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? 'Đang tạo...' : 'Tạo Playbook'}
          </button>
        </div>
      </section>

      <section className="space-y-6">
        {playbooks.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-gray-500">
            Chưa có playbook nào.
          </div>
        ) : (
          playbooks.map((playbook) => {
            const edit = getPlaybookEdit(playbook);
            const newPrompt = getNewPromptForm(playbook.id);
            const isEditingThisPrompt =
              editingPrompt?.playbookId === playbook.id;

            return (
              <div
                key={playbook.id}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={edit.topic_name}
                      onChange={(e) =>
                        setPlaybookEdits((prev) => ({
                          ...prev,
                          [playbook.id]: {
                            topic_name: e.target.value,
                            domain: edit.domain,
                          },
                        }))
                      }
                      className="w-full rounded-md border-gray-300 p-2 text-sm font-semibold text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <div className="mt-2">
                      <select
                        value={edit.domain}
                        onChange={(e) =>
                          setPlaybookEdits((prev) => ({
                            ...prev,
                            [playbook.id]: {
                              topic_name: edit.topic_name,
                              domain: e.target.value as PromptPlaybook['domain'],
                            },
                          }))
                        }
                        className="rounded-md border-gray-300 p-2 text-xs shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        {domainOptions.map((domain) => (
                          <option key={domain} value={domain}>
                            {domain}
                          </option>
                        ))}
                      </select>
                      <span className="ml-3 text-xs text-gray-500">
                        {playbook.prompts?.length || 0} prompts
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdatePlaybookMeta(playbook)}
                      disabled={saving}
                      className="rounded-md border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 disabled:opacity-60"
                    >
                      Lưu Playbook
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePlaybook(playbook.id)}
                      disabled={saving}
                      className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                    >
                      Xoá
                    </button>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <h4 className="text-sm font-semibold text-gray-800">
                    Prompts
                  </h4>

                  {(playbook.prompts || []).length === 0 && (
                    <div className="text-sm text-gray-500">
                      Chưa có prompt nào.
                    </div>
                  )}

                  {(playbook.prompts || []).map((prompt, index) => (
                    <div
                      key={`${playbook.id}-${index}`}
                      className="rounded-md border border-gray-100 bg-gray-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-xs font-semibold text-purple-600">
                            {prompt.stage}
                          </div>
                          <div className="text-sm font-semibold text-gray-900">
                            {prompt.title}
                          </div>
                          <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                            {prompt.content}
                          </p>
                          {prompt.variables && prompt.variables.length > 0 && (
                            <div className="mt-2 text-xs text-gray-500">
                              Variables: {prompt.variables.join(', ')}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingPrompt({
                                playbookId: playbook.id,
                                index,
                                form: createPromptFormState(prompt),
                              })
                            }
                            className="rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-white"
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePrompt(playbook, index)}
                            className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                          >
                            Xoá
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {isEditingThisPrompt && editingPrompt && (
                    <div className="rounded-md border border-blue-100 bg-blue-50 p-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Stage
                          </label>
                          <select
                            value={editingPrompt.form.stage}
                            onChange={(e) =>
                              setEditingPrompt((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      form: {
                                        ...prev.form,
                                        stage: e.target
                                          .value as PromptItem['stage'],
                                      },
                                    }
                                  : prev
                              )
                            }
                            className="w-full rounded-md border-gray-300 p-2 text-xs shadow-sm"
                          >
                            {stageOptions.map((stage) => (
                              <option key={stage} value={stage}>
                                {stage}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Title
                          </label>
                          <input
                            type="text"
                            value={editingPrompt.form.title}
                            onChange={(e) =>
                              setEditingPrompt((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      form: {
                                        ...prev.form,
                                        title: e.target.value,
                                      },
                                    }
                                  : prev
                              )
                            }
                            className="w-full rounded-md border-gray-300 p-2 text-xs shadow-sm"
                          />
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Content
                        </label>
                        <textarea
                          rows={4}
                          value={editingPrompt.form.content}
                          onChange={(e) =>
                            setEditingPrompt((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    form: {
                                      ...prev.form,
                                      content: e.target.value,
                                    },
                                  }
                                : prev
                            )
                          }
                          className="w-full rounded-md border-gray-300 p-2 text-xs shadow-sm"
                        />
                      </div>

                      <div className="mt-3 grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Variables (comma-separated)
                          </label>
                          <input
                            type="text"
                            value={editingPrompt.form.variablesText}
                            onChange={(e) =>
                              setEditingPrompt((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      form: {
                                        ...prev.form,
                                        variablesText: e.target.value,
                                      },
                                    }
                                  : prev
                              )
                            }
                            className="w-full rounded-md border-gray-300 p-2 text-xs shadow-sm"
                          />
                        </div>
                        <div className="flex items-center gap-2 mt-6">
                          <input
                            type="checkbox"
                            checked={editingPrompt.form.include_project_context}
                            onChange={(e) =>
                              setEditingPrompt((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      form: {
                                        ...prev.form,
                                        include_project_context: e.target.checked,
                                      },
                                    }
                                  : prev
                              )
                            }
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-600">
                            Include project context
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-gray-500">
                        Preview:
                        <pre className="mt-2 whitespace-pre-wrap rounded-md bg-white p-3 text-xs text-gray-700">
                          {promptPreview}
                        </pre>
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleSavePromptEdit}
                          disabled={saving}
                          className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                          Lưu Prompt
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingPrompt(null)}
                          className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-white"
                        >
                          Huỷ
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="rounded-md border border-dashed border-gray-200 p-4">
                    <h5 className="text-xs font-semibold text-gray-700 mb-3">
                      Thêm Prompt mới
                    </h5>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Stage
                        </label>
                        <select
                          value={newPrompt.stage}
                          onChange={(e) =>
                            setNewPromptForms((prev) => ({
                              ...prev,
                              [playbook.id]: {
                                ...newPrompt,
                                stage: e.target.value as PromptItem['stage'],
                              },
                            }))
                          }
                          className="w-full rounded-md border-gray-300 p-2 text-xs shadow-sm"
                        >
                          {stageOptions.map((stage) => (
                            <option key={stage} value={stage}>
                              {stage}
                            </option>
                          ))}
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
                            setNewPromptForms((prev) => ({
                              ...prev,
                              [playbook.id]: {
                                ...newPrompt,
                                title: e.target.value,
                              },
                            }))
                          }
                          className="w-full rounded-md border-gray-300 p-2 text-xs shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Content
                      </label>
                      <textarea
                        rows={3}
                        value={newPrompt.content}
                        onChange={(e) =>
                          setNewPromptForms((prev) => ({
                            ...prev,
                            [playbook.id]: {
                              ...newPrompt,
                              content: e.target.value,
                            },
                          }))
                        }
                        className="w-full rounded-md border-gray-300 p-2 text-xs shadow-sm"
                      />
                    </div>

                    <div className="mt-3 grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Variables (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={newPrompt.variablesText}
                          onChange={(e) =>
                            setNewPromptForms((prev) => ({
                              ...prev,
                              [playbook.id]: {
                                ...newPrompt,
                                variablesText: e.target.value,
                              },
                            }))
                          }
                          className="w-full rounded-md border-gray-300 p-2 text-xs shadow-sm"
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-6">
                        <input
                          type="checkbox"
                          checked={newPrompt.include_project_context}
                          onChange={(e) =>
                            setNewPromptForms((prev) => ({
                              ...prev,
                              [playbook.id]: {
                                ...newPrompt,
                                include_project_context: e.target.checked,
                              },
                            }))
                          }
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-600">
                          Include project context
                        </span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => handleAddPrompt(playbook)}
                        disabled={saving}
                        className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black disabled:opacity-60"
                      >
                        Thêm Prompt
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
