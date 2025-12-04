'use client';

import { useState } from 'react';
import { type ProductSpecItem } from '@/app/admin/products/productFormTypes';
import type { ProductFormState } from '@/app/admin/products/[id]/edit/page';
import SymbolPickerDialog from './SymbolPickerDialog';

interface FeaturesTabProps {
  form: ProductFormState;
  setForm: (
    f: ProductFormState | ((prev: ProductFormState) => ProductFormState)
  ) => void;
}

export default function FeaturesTab({ form, setForm }: FeaturesTabProps) {
  // Component nút bấm icon nhỏ gọn
  const SymbolButton = ({ onClick }: { onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className="absolute bottom-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-gray-200/80 text-gray-600 backdrop-blur-sm hover:bg-gray-300/90"
      title="Insert Symbol"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.874 15.126A7.5 7.5 0 0112 7.5h0a7.5 7.5 0 017.126 7.626M12 7.5v1.5a3 3 0 00-3 3h-1.5a4.5 4.5 0 014.5-4.5h0zM12 7.5v1.5a3 3 0 013 3h1.5a4.5 4.5 0 00-4.5-4.5h0z"
        />
      </svg>
    </button>
  );
  const [isSymbolPickerOpen, setIsSymbolPickerOpen] = useState(false);

  // KeyFeatures, UseCases, Limitations, Compatibility – mỗi dòng 1 item
  const handleLinesChange = (
    raw: string,
    field: 'keyFeatures' | 'useCases' | 'limitations' | 'compatibility'
  ) => {
    const lines = raw.split(/\r?\n/);
    setForm({ ...form, [field]: lines });
  };

  // Specs: list key/value
  const handleSpecChange = (
    index: number,
    field: keyof ProductSpecItem,
    value: string
  ) => {
    const specs = form.specs.map((s, i) =>
      i === index ? { ...s, [field]: value } : s
    );
    setForm({ ...form, specs });
  };

  const addSpec = () => {
    const specs = [...form.specs, { key: '', value: '' }];
    setForm({ ...form, specs });
  };

  const removeSpec = (index: number) => {
    const specs = form.specs.filter((_, i) => i !== index);
    setForm({ ...form, specs });
  };

  return (
    <div className="space-y-6 p-4 lg:p-0">
      <SymbolPickerDialog
        isOpen={isSymbolPickerOpen}
        onClose={() => setIsSymbolPickerOpen(false)}
      />
      {/* Key Features */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Key Features
        </label>
        <div className="relative mt-1">
          <textarea
            className="block w-full min-h-[140px] rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder={
              '400mm travel – MGN12H rail\nMax load 8kg\nNEMA17 40mm motor\n...'
            }
            value={form.keyFeatures.join('\n')}
            onChange={(e) => handleLinesChange(e.target.value, 'keyFeatures')}
          />
          <SymbolButton onClick={() => setIsSymbolPickerOpen(true)} />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Each line is a feature. Used for bullet lists and for AI to quickly
          understand the product.
        </p>
      </div>

      {/* Specs */}
      <div className="border-t pt-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-800">
            Main Specifications (Specs)
          </h3>
          <button
            type="button"
            onClick={addSpec}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            + Add Spec
          </button>
        </div>

        {form.specs.length === 0 && (
          <p className="text-xs text-gray-500">
            No specs yet. You can add items like: <br />
            Travel = 400mm, Accuracy = ±0.05mm, Max Speed = 1500rpm...
          </p>
        )}

        <div className="space-y-2">
          {form.specs.map((spec, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-[1fr,1fr,auto] gap-2 items-end"
            >
              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Spec Name
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Travel"
                  value={spec.key}
                  onChange={(e) =>
                    handleSpecChange(index, 'key', e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Value
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="400mm"
                  value={spec.value}
                  onChange={(e) =>
                    handleSpecChange(index, 'value', e.target.value)
                  }
                />
              </div>
              <button
                type="button"
                onClick={() => removeSpec(index)}
                className="inline-flex justify-center rounded-md border border-red-300 bg-white px-2 py-1 text-[11px] font-medium text-red-600 shadow-sm hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Use cases */}
      <div className="border-t pt-4 space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Main Use Cases
        </label>
        <div className="relative mt-1">
          <textarea
            className="block w-full min-h-[100px] rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder={
              'Mini CNC machine\nClay extruder\nPick & place machine\n...'
            }
            value={form.useCases.join('\n')}
            onChange={(e) => handleLinesChange(e.target.value, 'useCases')}
          />
          <SymbolButton onClick={() => setIsSymbolPickerOpen(true)} />
        </div>
        <p className="text-xs text-gray-500">
          Each line is an application. Helps AI advise on product suitability.
        </p>
      </div>

      {/* Limitations */}
      <div className="border-t pt-4 space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Limitations / Notes
        </label>
        <div className="relative mt-1">
          <textarea
            className="block w-full min-h-[80px] rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder={
              'Not suitable for loads > 8kg\nUnstable above 1800rpm\n...'
            }
            value={form.limitations.join('\n')}
            onChange={(e) => handleLinesChange(e.target.value, 'limitations')}
          />
          <SymbolButton onClick={() => setIsSymbolPickerOpen(true)} />
        </div>
        <p className="text-xs text-gray-500">
          These limitations are useful for AI when providing advice.
        </p>
      </div>

      {/* Compatibility */}
      <div className="border-t pt-4 space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Compatibility
        </label>
        <div className="relative mt-1">
          <textarea
            className="block w-full min-h-[80px] rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder={
              'NEMA17 motor\nTMC2209 driver\n2020 aluminum profile\n...'
            }
            value={form.compatibility.join('\n')}
            onChange={(e) => handleLinesChange(e.target.value, 'compatibility')}
          />
          <SymbolButton onClick={() => setIsSymbolPickerOpen(true)} />
        </div>
        <p className="text-xs text-gray-500">
          Each line is a compatible item (driver, motor, profile, rail...).
        </p>
      </div>
    </div>
  );
}
