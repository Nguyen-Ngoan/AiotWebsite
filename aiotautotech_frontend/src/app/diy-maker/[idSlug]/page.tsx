// src/app/diy-maker/[idSlug]/page.tsx

import { ProductDetailPageImpl } from './ProductDetailPage';

interface RouteParams {
  idSlug: string;
}

// Next 15: params là Promise<RouteParams>
export default async function Page({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const resolvedParams = await params; // ✅ unwrap Promise

  return <ProductDetailPageImpl params={resolvedParams} />;
}
