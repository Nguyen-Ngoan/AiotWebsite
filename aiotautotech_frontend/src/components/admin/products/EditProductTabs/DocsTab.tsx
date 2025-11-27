// src/components/admin/products/EditProductTabs/DocsTab.tsx

"use client";

import { ProductFormState } from "@/app/admin/products/productFormTypes";

interface DocsTabProps {
  form: ProductFormState;
  setForm: (f: ProductFormState) => void;
}

export default function DocsTab({ form, setForm }: DocsTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Datasheet URL</label>
          <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500" value={form.datasheetUrl} onChange={(e) => setForm({ ...form, datasheetUrl: e.target.value })} placeholder="https://..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Schematic URL</label>
          <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500" value={form.schematicUrl} onChange={(e) => setForm({ ...form, schematicUrl: e.target.value })} placeholder="https://..." />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">STEP model URL</label>
          <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500" value={form.stepModelUrl} onChange={(e) => setForm({ ...form, stepModelUrl: e.target.value })} placeholder="https://..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">STL files URL</label>
          <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500" value={form.stlFilesUrl} onChange={(e) => setForm({ ...form, stlFilesUrl: e.target.value })} placeholder="https://..." />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">User manual URL</label>
          <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500" value={form.userManualUrl} onChange={(e) => setForm({ ...form, userManualUrl: e.target.value })} placeholder="https://..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">GitHub repo URL</label>
          <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500" value={form.githubRepoUrl} onChange={(e) => setForm({ ...form, githubRepoUrl: e.target.value })} placeholder="https://github.com/..." />
        </div>
      </div>
    </div>
  );
}
