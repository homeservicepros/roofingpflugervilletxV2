/** Leading emoji used as decoration in the legacy copy (📞 ✓ ⭐ …) are replaced by SVG icons in the new design. */
export const stripEmoji = (s: string) =>
  s.replace(/^[\p{Extended_Pictographic}\p{Emoji_Presentation}✓✔️\s]+/u, '').trim();

/** "Roof Repair Pflugerville TX" -> "Roof Repair" (used only where space is tight; full title stays in title/aria). */
export const shortLabel = (title: string) => title.replace(/\s+Pflugerville,?\s+TX$/i, '').trim();

export const slugToName = (slug: string) =>
  slug
    .replace(/-78660$/, '')
    .split('-')
    .map((w) => (['at', 'of', 'the'].includes(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');

export const plain = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

export const truncate = (s: string, n: number) => (s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…');

const entities: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&apos;': "'", '&nbsp;': ' ' };
export const decode = (s: string) =>
  s.replace(/&(amp|lt|gt|quot|#39|apos|nbsp);/g, (m) => entities[m] ?? m).replace(/&#(\d+);/g, (_m, n) => String.fromCharCode(Number(n)));

/** Minimal HTML → Markdown for the legacy prose (p, h2/h3, ul/li, table, strong, a). Used for llms-full.txt. */
export function htmlToMd(html: string, base = ''): string {
  let s = html
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n\n## $1\n\n')
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n\n### $1\n\n')
    // internal links keep their URL; external links keep only the visible text (except .gov references)
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_m, href, t) =>
      href.startsWith('/') ? `[${t}](${base + href})` : /^https?:\/\/[^/]*\.gov\//.test(href) ? `[${t}](${href})` : t)
    .replace(/<(strong|b)>([\s\S]*?)<\/\1>/gi, '**$2**')
    .replace(/<tr[^>]*>([\s\S]*?)<\/tr>/gi, (_m, row) => '\n| ' + [...row.matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)].map((c) => c[1].trim()).join(' | ') + ' |')
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '\n- $1')
    .replace(/<\/(p|ul|ol|table)>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '');
  s = decode(s).replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  return s;
}
