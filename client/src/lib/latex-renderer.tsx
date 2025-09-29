import { useEffect } from "react";

declare global {
  interface Window {
    renderMathInElement?: (element: Element, options?: any) => void;
    katex?: any;
  }
}

export function useLatexRenderer() {
  useEffect(() => {
    const renderMath = () => {
      if (window.renderMathInElement) {
        window.renderMathInElement(document.body, {
          delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false}
          ],
          throwOnError: false,
          errorColor: '#cc0000',
          strict: false
        });
      }
    };

    // Load KaTeX if not already loaded
    if (!window.katex) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js';
      script.onload = renderMath;
      document.head.appendChild(script);
    } else {
      renderMath();
    }
  }, []);

  return { renderMath: () => {
    if (window.renderMathInElement) {
      window.renderMathInElement(document.body, {
        delimiters: [
          {left: '$$', right: '$$', display: true},
          {left: '$', right: '$', display: false}
        ],
        throwOnError: false,
        errorColor: '#cc0000',
        strict: false
      });
    }
  }};
}

export function LatexRenderer({ children }: { children: React.ReactNode }) {
  useLatexRenderer();
  return <>{children}</>;
}
