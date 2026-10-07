import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { mkdir, rename } from 'node:fs/promises';
import path from 'node:path';

/**
 * `build.format: 'file'` writes the blog index as blog.html. The legacy site served it from
 * blog/index.html at /blog/ — move it back so that URL (and its trailing slash) is unchanged.
 */
const blogIndexAsDirectory = {
  name: 'blog-index-as-directory',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      const out = fileURLToPath(dir);
      await mkdir(path.join(out, 'blog'), { recursive: true });
      await rename(path.join(out, 'blog.html'), path.join(out, 'blog', 'index.html'));
    },
  },
};

// Canonical production host. Override with PUBLIC_SITE_URL for staging builds if ever needed.
const site = (process.env.PUBLIC_SITE_URL || 'https://www.pflugervilleroofexperts.com').replace(/\/$/, '');

export default defineConfig({
  site,
  output: 'static',
  // The legacy site served extensionless URLs (/services/roof-repair-pflugerville-tx) from .html files
  // on Cloudflare Pages. `format: 'file'` emits exactly the same layout, so every URL stays identical.
  build: { format: 'file', inlineStylesheets: 'always' },
  trailingSlash: 'ignore',
  compressHTML: true,
  devToolbar: { enabled: false },
  integrations: [blogIndexAsDirectory],
  vite: {
    plugins: [tailwindcss()],
    build: { assetsInlineLimit: 0 },
  },
});
