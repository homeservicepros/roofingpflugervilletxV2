// Generates the stable files that must live in /public (favicons, schema logo, OG image)
// from the media pack in src/assets. Run: npm run brand-assets
import sharp from 'sharp';
import { writeFile, mkdir } from 'node:fs/promises';

const src = 'src/assets/brand/logo.webp';
await mkdir('public', { recursive: true });

// --- locate the artwork inside the 1024px transparent canvas ---
const full = sharp(src).ensureAlpha();
const { data, info } = await full.raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const alphaAt = (x, y) => data[(y * W + x) * 4 + 3];
function bbox(y0, y1) {
  let minX = W, maxX = 0, minY = H, maxY = 0;
  for (let y = y0; y < y1; y++)
    for (let x = 0; x < W; x++)
      if (alphaAt(x, y) > 20) {
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}
const art = bbox(0, H);
// the shield mark sits above the wordmark: find the first fully transparent row band after the shield
let y = art.top;
while (y < H && bbox(y, y + 1).width > 1) y++;
const shield = bbox(art.top, y);
console.log('artwork', art, 'shield', shield);

// shield icon (transparent) for the header lockup
const pad = 6;
await sharp(src)
  .extract({ left: shield.left - pad, top: shield.top - pad, width: shield.width + pad * 2, height: shield.height + pad * 2 })
  .png({ compressionLevel: 9 })
  .toFile('src/assets/brand/shield.png');

// full lockup, tightly cropped, transparent
await sharp(src)
  .extract({ left: art.left - 8, top: art.top - 8, width: art.width + 16, height: art.height + 16 })
  .png({ compressionLevel: 9 })
  .toFile('src/assets/brand/logo-lockup.png');

// schema/Knowledge-Graph logo: square, white background
const lockup = await sharp('src/assets/brand/logo-lockup.png').resize(440, 440, { fit: 'inside' }).toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: '#ffffff' } })
  .composite([{ input: lockup, gravity: 'center' }])
  .png({ compressionLevel: 9 })
  .toFile('public/logo.png');

// favicons from the shield mark
const mark = (n) =>
  sharp('src/assets/brand/shield.png').resize(n, n, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png({ compressionLevel: 9, palette: true, quality: 92 });
for (const n of [48, 96, 192, 512]) await mark(n).toFile(`public/favicon-${n}.png`);
await sharp('src/assets/brand/shield.png')
  .resize(140, 140, { fit: 'contain', background: '#ffffff' })
  .extend({ top: 20, bottom: 20, left: 20, right: 20, background: '#ffffff' })
  .flatten({ background: '#ffffff' })
  .png().toFile('public/apple-touch-icon.png');

// favicon.ico (PNG-compressed single-image ICO) for crawlers that still request /favicon.ico
const png48 = await mark(48).toBuffer();
const hdr = Buffer.alloc(22);
hdr.writeUInt16LE(0, 0); hdr.writeUInt16LE(1, 2); hdr.writeUInt16LE(1, 4);
hdr[6] = 48; hdr[7] = 48; hdr[8] = 0; hdr[9] = 0;
hdr.writeUInt16LE(1, 10); hdr.writeUInt16LE(32, 12);
hdr.writeUInt32LE(png48.length, 14); hdr.writeUInt32LE(22, 18);
await writeFile('public/favicon.ico', Buffer.concat([hdr, png48]));

// Open Graph / social share image 1200x630: team photo + logo card
const base = await sharp('src/assets/authority/team-composite.webp').resize(1200, 630, { fit: 'cover', position: 'attention' }).toBuffer();
const card = await sharp({ create: { width: 300, height: 250, channels: 4, background: '#ffffff' } })
  .composite([{ input: await sharp('src/assets/brand/logo-lockup.png').resize(260, 210, { fit: 'inside' }).toBuffer(), gravity: 'center' }])
  .png().toBuffer();
const round = Buffer.from('<svg width="300" height="250"><rect width="300" height="250" rx="22"/></svg>');
const roundedCard = await sharp(card).composite([{ input: round, blend: 'dest-in' }]).png().toBuffer();
await sharp(base)
  .composite([{ input: roundedCard, left: 48, top: 332 }])
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile('public/og-default.jpg');
console.log('brand assets written');
