// src/components/admin/products/EditProductTabs/DocsTab.tsx

'use client';
import { ProductFormState } from '@/app/admin/products/productFormTypes';
import DocUploader from './DocUploader';

interface DocsTabProps {
  form: ProductFormState;
  setForm: (f: ProductFormState) => void;
  productId: string;
}

export default function DocsTab({ form, setForm, productId }: DocsTabProps) {
  const handleUploadComplete = (field: string, url: string) => {
    // Backend trả về field dạng snake_case (vd: datasheet_url).
    // Ta cần chuyển nó sang camelCase (vd: datasheetUrl) để cập nhật state của form.
    const camelCaseField = field.replace(/_([a-z])/g, (g) =>
      g[1].toUpperCase()
    );
    setForm({ ...form, [camelCaseField]: url });
  };

  const handleClear = (field: string) => {
    setForm({ ...form, [field]: '' });
  };

  const docFields: { label: string; docType: keyof ProductFormState }[] = [
    { label: 'Datasheet URL', docType: 'datasheetUrl' },
    { label: 'Schematic URL', docType: 'schematicUrl' },
    { label: 'STEP model URL', docType: 'stepModelUrl' },
    { label: 'STL files URL', docType: 'stlFilesUrl' },
    { label: 'User manual URL', docType: 'userManualUrl' },
    { label: 'GitHub repo URL', docType: 'githubRepoUrl' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
      {docFields.map((field) => (
        <DocUploader
          key={field.docType}
          label={field.label}
          productId={productId}
          docType={field.docType as any}
          currentUrl={form[field.docType] as string}
          onUploadComplete={handleUploadComplete}
          onClear={handleClear}
        />
      ))}
    </div>
  );
}
