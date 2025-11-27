"use client";

import { ProductFormState, ProductSpecItem } from "@/app/admin/products/productFormTypes";
interface FeaturesTabProps {
  form: ProductFormState;
  setForm: (f: ProductFormState) => void;
}

export default function FeaturesTab({ form, setForm }: FeaturesTabProps) {
  // KeyFeatures, UseCases, Limitations, Compatibility – mỗi dòng 1 item
  const handleLinesChange = (raw: string, field: "keyFeatures" | "useCases" | "limitations" | "compatibility") => {
    const lines = raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    setForm({ ...form, [field]: lines });
  };

  // Specs: list key/value
  const handleSpecChange = (index: number, field: keyof ProductSpecItem, value: string) => {
    const specs = form.specs.map((s, i) => (i === index ? { ...s, [field]: value } : s));
    setForm({ ...form, specs });
  };

  const addSpec = () => {
    const specs = [...form.specs, { key: "", value: "" }];
    setForm({ ...form, specs });
  };

  const removeSpec = (index: number) => {
    const specs = form.specs.filter((_, i) => i !== index);
    setForm({ ...form, specs });
  };

  return (
    <div className="space-y-6">
      {/* Key Features */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Đặc điểm nổi bật (Key Features)</label>
        <textarea className="mt-1 block w-full min-h-[140px] rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500" placeholder={"Hành trình 400mm – ray MGN12H\nTải tối đa 8kg\nĐộng cơ NEMA17 40mm\n..."} value={form.keyFeatures.join("\n")} onChange={(e) => handleLinesChange(e.target.value, "keyFeatures")} />
        <p className="text-xs text-gray-500 mt-1">Mỗi dòng là một đặc điểm. Dùng để render bullet list và giúp AI hiểu nhanh về sản phẩm.</p>
      </div>

      {/* Specs */}
      <div className="border-t pt-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-800">Thông số kỹ thuật chính (Specs)</h3>
          <button type="button" onClick={addSpec} className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50">
            + Thêm thông số
          </button>
        </div>

        {form.specs.length === 0 && (
          <p className="text-xs text-gray-500">
            Chưa có thông số nào. Bạn có thể thêm các dòng như: <br />
            Hành trình = 400mm, Độ chính xác = ±0.05mm, Tốc độ tối đa = 1500rpm...
          </p>
        )}

        <div className="space-y-2">
          {form.specs.map((spec, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr,1fr,auto] gap-2 items-end">
              <div>
                <label className="block text-xs font-medium text-gray-700">Tên thông số</label>
                <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1 text-xs shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500" placeholder="Hành trình" value={spec.key} onChange={(e) => handleSpecChange(index, "key", e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Giá trị</label>
                <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1 text-xs shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500" placeholder="400mm" value={spec.value} onChange={(e) => handleSpecChange(index, "value", e.target.value)} />
              </div>
              <button type="button" onClick={() => removeSpec(index)} className="inline-flex justify-center rounded-md border border-red-300 bg-white px-2 py-1 text-[11px] font-medium text-red-600 shadow-sm hover:bg-red-50">
                Xóa
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Use cases */}
      <div className="border-t pt-4 space-y-1">
        <label className="block text-sm font-medium text-gray-700">Ứng dụng chính (Use cases)</label>
        <textarea className="mt-1 block w-full min-h-[100px] rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500" placeholder={"Máy CNC mini\nMáy đùn đất sét\nMáy pick & place\n..."} value={form.useCases.join("\n")} onChange={(e) => handleLinesChange(e.target.value, "useCases")} />
        <p className="text-xs text-gray-500">Mỗi dòng là một ứng dụng. Giúp AI tư vấn “sản phẩm nào phù hợp cho máy X?”.</p>
      </div>

      {/* Limitations */}
      <div className="border-t pt-4 space-y-1">
        <label className="block text-sm font-medium text-gray-700">Giới hạn / Lưu ý (Limitations)</label>
        <textarea className="mt-1 block w-full min-h-[80px] rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500" placeholder={"Không phù hợp tải > 8kg\nKhông chạy ổn định trên 1800rpm\n..."} value={form.limitations.join("\n")} onChange={(e) => handleLinesChange(e.target.value, "limitations")} />
        <p className="text-xs text-gray-500">Những giới hạn này rất hữu ích cho AI khi tư vấn “có dùng được cho case này không?”.</p>
      </div>

      {/* Compatibility */}
      <div className="border-t pt-4 space-y-1">
        <label className="block text-sm font-medium text-gray-700">Tương thích (Compatibility)</label>
        <textarea className="mt-1 block w-full min-h-[80px] rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500" placeholder={"Động cơ NEMA17\nDriver TMC2209\nNhôm định hình 2020\n..."} value={form.compatibility.join("\n")} onChange={(e) => handleLinesChange(e.target.value, "compatibility")} />
        <p className="text-xs text-gray-500">Mỗi dòng là một đối tượng tương thích (driver, động cơ, profile, rail...).</p>
      </div>
    </div>
  );
}
