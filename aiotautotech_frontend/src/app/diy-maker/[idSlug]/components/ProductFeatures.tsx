// src/app/diy-maker/[idSlug]/components/ProductFeatures.tsx

import type { ProductSpecItem } from "../ProductDetailPage";

interface ProductFeaturesProps {
  hasAnyFeatures: boolean;
  key_features?: string[];
  use_cases?: string[];
  limitations?: string[];
  compatibility?: string[];
  specs?: ProductSpecItem[];
}

export function ProductFeatures({ hasAnyFeatures, key_features, use_cases, limitations, compatibility, specs }: ProductFeaturesProps) {
  return (
    <details className="rounded-2xl border border-gray-800 bg-[#050608] p-4" open={hasAnyFeatures}>
      <summary className="cursor-pointer list-none text-sm font-semibold text-gray-100">
        Đặc điểm &amp; ứng dụng
        <span className="ml-2 text-xs font-normal text-gray-500">(key features, use case, giới hạn…)</span>
      </summary>
      <div className="mt-3 border-t border-gray-800 pt-3 space-y-4 text-sm text-gray-200">
        {!hasAnyFeatures && (
          <p className="text-sm text-gray-400">
            Chưa khai báo phần Features cho sản phẩm này trong trang Admin. Bạn có thể thêm
            <span className="font-semibold"> Key features / Use cases / Limitations / Specs </span>
            để AI hiểu rõ hơn về sản phẩm.
          </p>
        )}

        {key_features && key_features.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Key features</h3>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
              {key_features.map((f, idx) => (
                <li key={idx}>{f}</li>
              ))}
            </ul>
          </div>
        )}

        {use_cases && use_cases.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Use cases / Ứng dụng</h3>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
              {use_cases.map((uc, idx) => (
                <li key={idx}>{uc}</li>
              ))}
            </ul>
          </div>
        )}

        {limitations && limitations.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Giới hạn / Lưu ý</h3>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
              {limitations.map((lm, idx) => (
                <li key={idx}>{lm}</li>
              ))}
            </ul>
          </div>
        )}

        {compatibility && compatibility.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Tương thích</h3>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
              {compatibility.map((cp, idx) => (
                <li key={idx}>{cp}</li>
              ))}
            </ul>
          </div>
        )}

        {specs && specs.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Thông số kỹ thuật</h3>
            <div className="mt-2 overflow-hidden rounded-xl border border-gray-800 bg-black/40 text-xs">
              <table className="min-w-full border-collapse">
                <tbody>
                  {specs.map((item, idx) => {
                    if (!item || (!item.key && !item.value)) return null;
                    return (
                      <tr key={idx} className={idx % 2 === 0 ? "bg-black/40" : "bg-black/20"}>
                        <td className="w-1/3 border-b border-gray-800 px-3 py-2 font-medium text-gray-200">{item.key || "—"}</td>
                        <td className="border-b border-gray-800 px-3 py-2 text-gray-300">{item.value || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </details>
  );
}
