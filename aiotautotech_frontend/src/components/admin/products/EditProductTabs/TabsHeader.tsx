// src/components/admin/products/EditProductTabs/TabsHeader.tsx
'use client';

import React from 'react';
import {
  InformationCircleIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  Squares2X2Icon,
  PhotoIcon,
  CursorArrowRaysIcon,
  WrenchScrewdriverIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';
import type { TabKey } from '@/app/admin/products/productFormTypes';

interface TabDef {
  key: TabKey | 'materials';
  label: string; // dùng cho tooltip + aria
}

// Định nghĩa tabs cố định, chỉ hiển thị icon, label dùng cho tooltip
const TABS: TabDef[] = [
  { key: 'basic', label: 'Basic' },
  { key: 'description', label: 'Desc' },
  { key: 'features', label: 'Features' },
  { key: 'bundle', label: 'Bundle' },
  { key: 'media', label: 'Media' },
  { key: 'seo', label: 'SEO' },
  { key: 'docs', label: 'Docs' },
  { key: 'materials', label: 'Materials' },
];

interface TabsHeaderProps {
  activeTab: TabKey | 'materials';
  setActiveTab: (tab: TabKey | 'materials') => void;
}

function getIconForTab(key: TabKey | 'materials') {
  switch (key) {
    case 'basic':
      return InformationCircleIcon;
    case 'description':
      return ChatBubbleLeftRightIcon;
    case 'features':
      return SparklesIcon;
    case 'bundle':
      return Squares2X2Icon;
    case 'media':
      return PhotoIcon;
    case 'seo':
      return CursorArrowRaysIcon;
    case 'docs':
      return WrenchScrewdriverIcon;
    case 'materials':
      return CubeIcon;
    default:
      return InformationCircleIcon;
  }
}

export function TabsHeader({ activeTab, setActiveTab }: TabsHeaderProps) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-1 py-1 shadow-sm">
      {TABS.map((tab) => {
        const Icon = getIconForTab(tab.key);
        const isActive = tab.key === activeTab;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`group relative inline-flex h-9 w-9 items-center justify-center rounded-full transition ${
              isActive
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
            }`}
            aria-label={tab.label}
          >
            <Icon className="h-5 w-5" />

            {/* Tooltip */}
            <div className="pointer-events-none absolute -bottom-9 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition group-hover:opacity-100">
              {tab.label}
              <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-gray-900" />
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default TabsHeader;
