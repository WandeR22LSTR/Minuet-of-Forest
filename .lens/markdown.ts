// A small Markdown renderer for Lens text blocks. It escapes all HTML first, so
// layout content can never inject markup. Swap it for the project's own
// Markdown pipeline if the project has one.

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const safeHref = (href: string) => (/^(https?:\/\/|\/|#|mailto:)/.test(href) ? href : '#');

/** Put the site's base path (astro.config `base`) in front of a site path, once. */
export function withBase(base: string, path: string): string {
  const b = base.replace(/\/+$/, '');
  if (!b || !path.startsWith('/') || path.startsWith('//') || path === b || path.startsWith(`${b}/`)) return path;
  return b + path;
}

function inline(text: string, base: string): string {
  const codes: string[] = [];
  let s = esc(text).replace(/`([^`]+)`/g, (_, c) => `\u0000${codes.push(c) - 1}\u0000`);
  s = s
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => `<a href="${withBase(base, safeHref(href))}">${label}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^\w*])\*([^*]+)\*(?!\w)/g, '$1<em>$2</em>')
    .replace(/(^|\W)_([^_]+)_(?!\w)/g, '$1<em>$2</em>')
    .replace(/==([^=]+)==/g, '<mark>$1</mark>');
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[Number(i)]}</code>`);
}

/** `base` is the site's base path, so links like [About](/about/) work under it. */
export function renderMarkdown(md: string, base = ''): string {
  const out: string[] = [];
  const blocks = md.replace(/\r\n?/g, '\n').trim().split(/\n{2,}/);
  for (const block of blocks) {
    const lines = block.split('\n');
    const heading = /^(#{1,6})\s+(.*)$/.exec(block);
    if (heading && lines.length === 1) {
      // Text blocks sit under the page's h1 and section h2s, so their headings start at h3.
      const level = Math.max(3, heading[1]!.length);
      out.push(`<h${level}>${inline(heading[2]!, base)}</h${level}>`);
    } else if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
      out.push(`<ul>${lines.map((l) => `<li>${inline(l.replace(/^\s*[-*]\s+/, ''), base)}</li>`).join('')}</ul>`);
    } else if (lines.every((l) => /^\s*\d+[.)]\s+/.test(l))) {
      out.push(`<ol>${lines.map((l) => `<li>${inline(l.replace(/^\s*\d+[.)]\s+/, ''), base)}</li>`).join('')}</ol>`);
    } else if (lines.every((l) => /^>/.test(l))) {
      out.push(`<blockquote>${renderMarkdown(lines.map((l) => l.replace(/^>\s?/, '')).join('\n'), base)}</blockquote>`);
    } else if (block.trim()) {
      out.push(`<p>${lines.map((l) => inline(l, base)).join(' ')}</p>`);
    }
  }
  return out.join('\n');
}
