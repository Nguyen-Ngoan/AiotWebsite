'use client';

import { useEffect, useMemo, useState } from 'react';
import { ProductDescription } from './ProductDescription';
import { ProductTechDocs } from './ProductTechDocs';
import {
  ProductAdminPanel,
  ProductAdminPanelProps,
} from './ProductAdminPanel';
import { TechnicalDoc } from './technical-doc';

interface ProductDetailTabsProps {
  descriptionHtml?: string;
  technicalDocs?: TechnicalDoc[];
  adminPanelProps: ProductAdminPanelProps;
}

type TabKey = 'description' | 'docs' | 'admin';

export function ProductDetailTabs({
  descriptionHtml,
  technicalDocs,
  adminPanelProps,
}: ProductDetailTabsProps) {
  const tabs = useMemo(
    () =>
      [
        {
          key: 'description' as TabKey,
          label: 'Mô tả chi tiết',
          visible: Boolean(descriptionHtml),
        },
        {
          key: 'docs' as TabKey,
          label: 'Tài liệu kỹ thuật',
          visible: Boolean(technicalDocs && technicalDocs.length > 0),
        },
        {
          key: 'admin' as TabKey,
          label: 'Admin Panel',
          visible: true,
        },
      ].filter((tab) => tab.visible),
    [descriptionHtml, technicalDocs]
  );

  const [activeTab, setActiveTab] = useState<TabKey>(
    tabs[0]?.key ?? 'admin'
  );

  useEffect(() => {
    if (!tabs.some((tab) => tab.key === activeTab)) {
      setActiveTab(tabs[0]?.key ?? 'admin');
    }
  }, [activeTab, tabs]);

  return (
    <section className="min-w-0 space-y-3">
      <div className="hide-scrollbar -mx-1 overflow-x-auto px-1">
        <div className="inline-flex min-w-full gap-2 rounded-md border border-gray-800 bg-[#050608] p-1">
          {tabs.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#1b1f35] text-[#b8b6ea]'
                    : 'text-gray-300 hover:bg-gray-800/70 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-w-0">
        {activeTab === 'description' && (
          <ProductDescription descriptionHtml={descriptionHtml} defaultOpen />
        )}
        {activeTab === 'docs' && (
          <ProductTechDocs docs={technicalDocs} defaultOpen />
        )}
        {activeTab === 'admin' && (
          <ProductAdminPanel {...adminPanelProps} defaultOpen />
        )}
      </div>
    </section>
  );
}
