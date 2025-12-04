// src/app/diy-maker/[idSlug]/components/ProductPriceAndInfo.tsx

'use client';

export interface ProductPriceAndInfoProps {
  short_description?: string;
  priceLabel?: string;
  statusLabel?: string;
  typeLabel?: string;
  tags?: string[];
  stock_tracking?: boolean;
  stock_qty?: number | null;
  min_order_qty?: number | null;
  currency?: string;
}

export function ProductPriceAndInfo({
  short_description,
  priceLabel,
  statusLabel,
  typeLabel,
  tags = [],
  stock_tracking,
  stock_qty,
  min_order_qty,
  currency,
}: ProductPriceAndInfoProps) {
  const displayCurrency = currency || 'VND';

  const stockLabel = (() => {
    if (!stock_tracking) return 'Không theo dõi tồn kho';
    if (stock_qty == null) return 'Chưa cập nhật số lượng';
    if (stock_qty <= 0) return 'Hết hàng';
    return `Còn khoảng ${stock_qty} sản phẩm`;
  })();

  return (
    <div className="w-full text-xs text-gray-300">
      <div className="space-y-3">
        {/* Mô tả ngắn */}
        {short_description && (
          <div
            className="prose prose-sm prose-invert max-w-none text-gray-300"
            dangerouslySetInnerHTML={{
              __html: short_description,
            }}
          />
        )}

        {/* Giá */}
        <div>
          <div className="text-[11px] uppercase tracking-wide text-gray-500">
            Giá tham khảo
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <div className="text-xl font-semibold text-blue-300">
              {priceLabel || 'Liên hệ'}
            </div>
            <span className="text-[11px] text-gray-500">{displayCurrency}</span>
          </div>
        </div>

        {/* Trạng thái */}
        <div className="flex flex-wrap items-center gap-2">
          {statusLabel && statusLabel !== 'Nháp' && (
            <span className="inline-flex items-center rounded-full border border-emerald-500/60 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-100">
              {statusLabel}
            </span>
          )}
          {typeLabel && (
            <span className="inline-flex items-center rounded-full border border-gray-600 px-2.5 py-1 text-[11px] font-medium text-gray-200">
              {typeLabel}
            </span>
          )}
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full border border-blue-500/50 bg-blue-500/10 px-2.5 py-1 text-[11px] font-medium text-blue-200"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Kho hàng */}
        <div className="mt-2 space-y-1">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Tồn kho
          </div>
          <p className="text-[12px] text-gray-200">{stockLabel}</p>
        </div>
      </div>
    </div>
  );
}
