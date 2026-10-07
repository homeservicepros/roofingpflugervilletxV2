// Static preview that mimics Cloudflare Pages routing for the ./dist output:
//   /foo -> foo.html, /dir/ -> dir/index.html, /foo.html -> 308 /foo, missing -> 404.html (status 404)
// Usage: node scripts/preview-pages.mjs [port]
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('dist');
const port = Number(process.argv[2] || 4321);
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
  '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json',
};
const isFile = async (p) => { try { return (await stat(p)).isFile(); } catch { return false; } };

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  let p = decodeURIComponent(url.pathname);
  const send = async (file, status = 200) => {
    res.writeHead(status, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(await readFile(file));
  };
  if (p.endsWith('/index.html')) { res.writeHead(308, { location: p.slice(0, -10) || '/' }); return res.end(); }
  if (p.endsWith('.html')) { res.writeHead(308, { location: p.slice(0, -5) }); return res.end(); }
  const candidates = p.endsWith('/') ? [path.join(root, p, 'index.html')] : [path.join(root, p), path.join(root, p + '.html')];
  for (const c of candidates) if (c.startsWith(root) && (await isFile(c))) return send(c);
  if (!p.endsWith('/') && (await isFile(path.join(root, p, 'index.html')))) { res.writeHead(308, { location: p + '/' }); return res.end(); }
  return send(path.join(root, '404.html'), 404);
}).listen(port, () => console.log(`http://localhost:${port}`));
