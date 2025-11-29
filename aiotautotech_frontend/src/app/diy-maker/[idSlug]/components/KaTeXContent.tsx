// src/app/diy-maker/[idSlug]/components/KaTeXContent.tsx
'use client';

import { useRef, useEffect } from 'react';

interface KaTeXContentProps {
  html: string;
}

export const KaTeXContent: React.FC<KaTeXContentProps> = ({ html }) => {
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!html || !contentRef.current) return;

    let cancelled = false;

    (async () => {
      try {
        // Dynamically import the auto-render extension for KaTeX
        const katexModule = await import('katex/contrib/auto-render');
        const renderMathInElement =
          (katexModule as any).default ??
          (katexModule as any).renderMathInElement;

        if (
          cancelled ||
          typeof renderMathInElement !== 'function' ||
          !contentRef.current
        ) {
          return;
        }

        renderMathInElement(contentRef.current, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
          ],
          throwOnError: false,
        });
      } catch (err) {
        if (!cancelled) {
          console.error('Error loading or rendering KaTeX:', err);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [html]);

  return <div ref={contentRef} dangerouslySetInnerHTML={{ __html: html }} />;
};
