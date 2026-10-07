import type { APIRoute } from 'astro';
import { abs, site } from '../config/site';
import { states } from '../data/states';

/**
 * Index of the main site sitemap plus every state sub-site sitemap
 * (https://{code}.pflugervilleroofexperts.com/sitemap.xml). States with `sitemap: false`
 * in src/data/states.ts are linked from the site but not listed here until their sitemap is live.
 */
export const GET: APIRoute = () => {
  const lastmod = new Date().toISOString().slice(0, 10);
  const entries = [abs('/sitemap.xml'), ...states.filter((s) => s.sitemap).map((s) => `https://${s.code}.${site.baseDomain}/sitemap.xml`)];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map((u) => `  <sitemap>\n    <loc>${u}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`).join('\n')}
</sitemapindex>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
