"use client";

import { TabKey } from "@/app/admin/products/productFormTypes";

interface TabsHeaderProps {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
}

export default function TabsHeader({ activeTab, setActiveTab }: TabsHeaderProps) {
  const tabs: { key: TabKey; label: string }[] = [
    { key: "basic", label: "Thông tin cơ bản" },
    { key: "description", label: "Mô tả" },
    { key: "features", label: "Features" },
    { key: "bundle", label: "Bundle" },
    { key: "media", label: "Ảnh" },
    { key: "seo", label: "SEO" },
    { key: "docs", label: "Tài liệu kỹ thuật" },
  ];

  return (
    <div className="border-b border-gray-200 mb-4">
      <nav className="-mb-px flex flex-wrap gap-3" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} className={"whitespace-nowrap py-2 px-3 border-b-2 text-sm font-medium transition-colors " + (isActive ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300")}>
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
