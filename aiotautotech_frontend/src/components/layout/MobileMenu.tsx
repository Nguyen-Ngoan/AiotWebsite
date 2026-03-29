// src/components/MobileMenu.tsx

import Link from 'next/link';

export type NavItem = {
  href: string;
  title: string;
  subtitle: string;
};

type MobileMenuProps = {
  open: boolean;
  items: NavItem[];
  onClose: () => void;
};

const titleClass =
  'text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-gray-100';
const subtitleClass =
  'mt-0.5 text-xs uppercase tracking-wide text-gray-600 dark:text-gray-400';

export function MobileMenu({ open, items, onClose }: MobileMenuProps) {
  if (!open) return null;

  const publicItems = items.filter((item) => item.href !== '/admin');
  const adminItem = items.find((item) => item.href === '/admin');

  return (
    <div className="mt-3 md:hidden">
      <div className="rounded-xl border border-gray-200 bg-white/95 p-3 shadow-md dark:border-gray-800 dark:bg-gray-900/95">
        <div className="space-y-1">
          {publicItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="block px-4 py-2 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <div className="flex flex-col leading-tight">
                <span className={titleClass}>{item.title}</span>
                <span className={subtitleClass}>{item.subtitle}</span>
              </div>
            </Link>
          ))}

          <Link
            href="/parts"
            onClick={onClose}
            className="block px-4 py-2 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <div className="flex flex-col leading-tight">
              <span className={titleClass}>Sản phẩm In 3D</span>
              <span className={subtitleClass}>Danh sách sản phẩm in 3D</span>
            </div>
          </Link>

          {adminItem && (
            <>
              <div
                className="my-3 border-t border-gray-200 dark:border-gray-700"
                role="separator"
                aria-hidden
              />
              <Link
                href={adminItem.href}
                onClick={onClose}
                className="block border border-amber-200/80 bg-amber-50/90 px-4 py-2 transition-colors duration-200 hover:bg-amber-100/90 dark:border-amber-800 dark:bg-amber-950/40 dark:hover:bg-amber-950/60"
              >
                <div className="flex flex-col leading-tight">
                  <span className={titleClass}>{adminItem.title}</span>
                  <span className={subtitleClass}>{adminItem.subtitle}</span>
                </div>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
