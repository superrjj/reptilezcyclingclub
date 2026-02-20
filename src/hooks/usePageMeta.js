import { useEffect } from 'react';

const BASE_TITLE = 'Reptilez Cycling Club';

// Simple helper to update only the document title.
// Description meta tag stays managed by public/index.html.
export const usePageMeta = (title) => {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const previousTitle = document.title;
    const fullTitle = title ? `${title} - ${BASE_TITLE}` : BASE_TITLE;
    document.title = fullTitle;

    return () => {
      document.title = previousTitle || BASE_TITLE;
    };
  }, [title]);
};



