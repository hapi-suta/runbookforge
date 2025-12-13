'use client';

import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(dirty: string): string {
  if (typeof window === 'undefined') {
    // Server-side: strip all HTML tags as a fallback
    return dirty.replace(/<[^>]*>/g, '');
  }
  
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
