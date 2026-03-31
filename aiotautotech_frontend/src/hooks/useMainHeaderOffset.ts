'use client';

import { useEffect, useRef, useState } from 'react';

/** Padding-top cho `<main>` bám theo chiều cao header cố định (dùng chung blog list / detail). */
export function useMainHeaderOffset(extraGapPx = 0) {
  const headerRef = useRef<HTMLElement>(null);
  const [mainPaddingTop, setMainPaddingTop] = useState(0);

  useEffect(() => {
    const updatePadding = () => {
      if (headerRef.current) {
        setMainPaddingTop(headerRef.current.offsetHeight);
      }
    };
    updatePadding();
    window.addEventListener('resize', updatePadding);
    return () => window.removeEventListener('resize', updatePadding);
  }, []);

  const paddingTop =
    mainPaddingTop > 0
      ? `${mainPaddingTop + extraGapPx}px`
      : extraGapPx > 0
        ? `calc(7rem + ${extraGapPx}px)`
        : '7rem';

  return { headerRef, paddingTop };
}
