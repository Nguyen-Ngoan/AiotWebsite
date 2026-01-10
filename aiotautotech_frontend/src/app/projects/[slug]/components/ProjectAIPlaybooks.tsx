'use client';

import React, { useState, useMemo } from 'react';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  CpuChipIcon,
  CommandLineIcon,
} from '@heroicons/react/24/outline';

export interface PromptItem {
  stage: 'CONCEPT' | 'UNIT_TEST' | 'INTEGRATION' | 'DEBUG';
  title: string;
  content: string;
  variables?: string[];
}

export interface Playbook {
  id: string;
  topic_name: string;
  domain: 'FIRMWARE' | 'BACKEND' | 'MECHANICAL';
  prompts: PromptItem[];
}

interface ProjectAIPlaybooksProps {
  projectId: string;
  playbooks: Playbook[];
}

export const ProjectAIPlaybooks: React.FC<ProjectAIPlaybooksProps> = ({
  playbooks,
}) => {
  const [expandedPlaybook, setExpandedPlaybook] = useState<string | null>(null);

  if (!playbooks || playbooks.length === 0) return null;

  return (
    <section
      id="ai-assistant"
      className="mt-12 scroll-mt-20 border-t border-gray-100 pt-12"
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <CpuChipIcon className="h-5 w-5 text-purple-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">
          AI Engineering Assistant
        </h2>
      </div>

      <div className="space-y-4">
        {playbooks.map((playbook) => (
          <div
            key={playbook.id}
            className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <button
              onClick={() =>
                setExpandedPlaybook(
                  expandedPlaybook === playbook.id ? null : playbook.id
                )
              }
              className="w-full flex items-center justify-between p-4 text-left bg-gray-50/50"
            >
              <div className="flex items-center gap-3">
                <DomainBadge domain={playbook.domain} />
                <span className="font-semibold text-gray-800">
                  {playbook.topic_name}
                </span>
              </div>
              {expandedPlaybook === playbook.id ? (
                <ChevronUpIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>

            {expandedPlaybook === playbook.id && (
              <div className="p-4 border-t border-gray-100">
                <PlaybookContent prompts={playbook.prompts} />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

const DomainBadge = ({ domain }: { domain: Playbook['domain'] }) => {
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
