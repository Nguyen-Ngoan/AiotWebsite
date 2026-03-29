'use client';

import { useEffect, useState } from 'react';

/**
 * Gọi API is-admin (kèm Basic Auth nếu trình duyệt đã lưu).
 * Khi chưa đăng nhập → isAdmin false.
 */
export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/is-admin', { credentials: 'same-origin' })
      .then((r) => {
        if (!r.ok) return { isAdmin: false };
        return r.json() as Promise<{ isAdmin?: boolean }>;
      })
      .then((data) => {
        if (!cancelled) setIsAdmin(!!data?.isAdmin);
      })
      .catch(() => {
        if (!cancelled) setIsAdmin(false);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { isAdmin, isLoading };
}
