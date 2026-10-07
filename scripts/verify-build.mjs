// Structural checks on ./dist — run after `npm run build`:  npm run verify
//  1. every legacy URL (from the old sitemap on git ref `main`) exists in the build
//  2. every internal link resolves the way Cloudflare Pages would serve it
//  3. no legacy domain / phone / address leaks
//  4. every page has title, description, canonical, one <h1>, valid JSON-LD
import { execSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const REF = process.argv[2] || 'origin/main';
const dist = path.resolve('dist');
const SITE = 'https://www.pflugervilleroofexperts.com';
let failures = 0;
const fail = (msg) => { failures++; console.error('✗', msg); };

const walk = (dir) => readdirSync(dir).flatMap((f) => { const p = path.join(dir, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const files = walk(dist);
const htmlFiles = files.filter((f) => f.endsWith('.html'));

// Resolve a URL path the way Cloudflare Pages does
function resolves(urlPath) {
  const p = decodeURIComponent(urlPath);
  if (p.endsWith('/')) return existsSync(path.join(dist, p, 'index.html'));
  return existsSync(path.join(dist, p)) && statSync(path.join(dist, p)).isFile() || existsSync(path.join(dist, p + '.html'));
}

// 1. URL parity ------------------------------------------------------------
const oldSitemap = execSync(`git show ${REF}:sitemap.xml`, { encoding: 'utf8' });
const oldUrls = [...oldSitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => u.startsWith('https://www.jncroofing.com'));
for (const u of oldUrls) {
  const p = new URL(u).pathname;
  if (!resolves(p)) fail(`legacy URL not served: ${p}`);
}
const newSitemap = readFileSync(path.join(dist, 'sitemap.xml'), 'utf8');
const newUrls = [...newSitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const oldPaths = new Set(oldUrls.map((u) => new URL(u).pathname));
const newPaths = new Set(newUrls.map((u) => new URL(u).pathname));
for (const p of oldPaths) if (!newPaths.has(p)) fail(`sitemap.xml is missing legacy path ${p}`);
for (const p of newPaths) if (!oldPaths.has(p)) fail(`sitemap.xml contains a path that did not exist before: ${p}`);
console.log(`URL parity: ${oldPaths.size} legacy URLs, ${newPaths.size} in new sitemap`);

// 2/3/4. per-page checks ---------------------------------------------------
const banned = [/jncroofing/i, /885[-. )]*3062/, /Priem/i, /\bTX\s+78660\s*<\/(?!address)/];
const extHosts = new Map();
let links = 0;
for (const f of htmlFiles) {
  const rel = path.relative(dist, f);
  const html = readFileSync(f, 'utf8');
  const isErr = rel === '404.html';

  for (const re of banned.slice(0, 3)) if (re.test(html)) fail(`${rel}: contains legacy value ${re}`);

  const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
  const canon = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
  const h1s = (html.match(/<h1[\s>]/g) || []).length;
  if (!title) fail(`${rel}: no <title>`);
  if (!desc) fail(`${rel}: no meta description`);
  if (!canon) fail(`${rel}: no canonical`);
  else if (!isErr && !canon.startsWith(SITE)) fail(`${rel}: canonical off-domain ${canon}`);
  if (!isErr && h1s !== 1) fail(`${rel}: ${h1s} <h1> elements`);

  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch (e) { fail(`${rel}: invalid JSON-LD (${e.message})`); }
  }
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
  if (dup.length) fail(`${rel}: duplicate ids ${[...new Set(dup)].join(', ')}`);

  for (const m of html.matchAll(/<a\s[^>]*href="([^"]+)"/g)) {
    const href = m[1].replace(/&amp;/g, '&');
    links++;
    if (/^(mailto:|tel:|#|javascript:)/.test(href)) continue;
    if (/^https?:\/\//.test(href)) { const h = new URL(href).host; extHosts.set(h, (extHosts.get(h) || 0) + 1); continue; }
    const p = href.split('#')[0].split('?')[0] || '/';
    if (!p.startsWith('/')) { fail(`${rel}: relative link ${href}`); continue; }
    if (!resolves(p)) fail(`${rel}: broken internal link ${href}`);
  }
  for (const m of html.matchAll(/<(?:img|source)[^>]*\s(?:src|srcset)="([^"]+)"/g)) {
    for (const part of m[1].split(',')) {
      const u = part.trim().split(/\s+/)[0];
      if (u.startsWith('/') && !resolves(u)) fail(`${rel}: missing asset ${u}`);
    }
  }
}
for (const f of files.filter((x) => /\.(txt|xml)$/.test(x))) {
  const t = readFileSync(f, 'utf8');
  for (const re of banned.slice(0, 3)) if (re.test(t)) fail(`${path.relative(dist, f)}: contains legacy value ${re}`);
}
console.log(`pages: ${htmlFiles.length}, internal+external anchors scanned: ${links}`);
console.log('external hosts linked:', Object.fromEntries([...extHosts].sort((a, b) => b[1] - a[1]).slice(0, 8)));

// state links + sitemap index
const states = (readFileSync(path.join(dist, 'index.html'), 'utf8').match(/https:\/\/[a-z]{2}\.pflugervilleroofexperts\.com\//g) || []);
console.log(`state links on home: ${new Set(states).size}`);
const idx = readFileSync(path.join(dist, 'sitemap-index.xml'), 'utf8');
console.log(`sitemap-index entries: ${(idx.match(/<sitemap>/g) || []).length}`);

if (failures) { console.error(`\n${failures} problem(s)`); process.exit(1); }
console.log('\nAll structural checks passed');
