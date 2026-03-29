import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tài liệu kỹ thuật | AIOT AutoTech',
  description:
    'File 3D, sơ đồ mạch, datasheet, code mẫu — tài liệu kỹ thuật cho DIY và tự động hóa.',
};

export default function TechnicalDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
