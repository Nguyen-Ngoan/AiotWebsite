// src/components/MobileMenu.tsx

import Link from "next/link";

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

export function MobileMenu({ open, items, onClose }: MobileMenuProps) {
  if (!open) return null;

  return (
    <div className="mt-3 md:hidden">
      <div className="space-y-2 rounded-xl border border-gray-200 bg-white/95 p-3 shadow-md dark:border-gray-800 dark:bg-gray-900/95">
        {items.map((item) => (
          <Link key={item.href} href={item.href} onClick={onClose} className="block rounded-lg px-2 py-2 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800">
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.title}</span>
              <span className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">{item.subtitle}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
