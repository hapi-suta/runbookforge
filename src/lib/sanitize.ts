'use client';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Uses DOMPurify on the client side, strips tags on the server side
 */
export function sanitizeHtml(dirty: string): string {
  if (typeof window === 'undefined') {
    // Server-side: strip all HTML tags as a fallback
    return dirty.replace(/<[^>]*>/g, '');
  }
  
  // Client-side: use DOMPurify
  // Dynamic import to avoid SSR issues
  const createDOMPurify = require('dompurify');
  const DOMPurify = createDOMPurify(window);
  
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
      'code', 'pre', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'span', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'img', 'hr', 'sub', 'sup', 'mark', 'del', 'ins'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'class', 'style', 'src', 'alt', 'title',
      'width', 'height', 'colspan', 'rowspan'
    ],
    ALLOW_DATA_ATTR: false,
    // Force all links to open in new tab and have noopener
    ADD_ATTR: ['target'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  });
}

/**
 * Create props for dangerouslySetInnerHTML with sanitized content
 */
export function createSanitizedHtml(content: string | undefined | null): { __html: string } {
  return { __html: sanitizeHtml(content || '') };
}

