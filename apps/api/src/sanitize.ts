import sanitizeHtml from 'sanitize-html';

/**
 * Contain untrusted author HTML inside the page viewport.
 * Scripts, event handlers, iframes, forms, and external assets are stripped.
 * Authors keep structural markup + inline styles (no url() in style).
 */
export function sanitizeSiteHtml(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'p',
      'br',
      'hr',
      'ul',
      'ol',
      'li',
      'blockquote',
      'pre',
      'code',
      'em',
      'strong',
      'i',
      'b',
      'u',
      's',
      'small',
      'span',
      'div',
      'section',
      'article',
      'header',
      'footer',
      'nav',
      'a',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'figure',
      'figcaption',
      'abbr',
      'cite',
      'q',
      'sub',
      'sup',
    ],
    allowedAttributes: {
      a: ['href', 'title', 'class'],
      '*': ['class', 'id', 'style', 'title'],
      td: ['colspan', 'rowspan'],
      th: ['colspan', 'rowspan'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowProtocolRelative: false,
    // Rewrite every link so the host page can intercept navigation.
    transformTags: {
      a: (tagName, attribs) => {
        const href = (attribs.href ?? '').trim();
        return {
          tagName: 'a',
          attribs: {
            ...attribs,
            href,
            'data-smallweb-link': href,
          },
        };
      },
    },
  });
}

export function htmlToSearchText(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, ' ')
    .trim();
}
