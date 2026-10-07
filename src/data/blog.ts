import postsRaw from './legacy/blog-posts.json';
import indexRaw from './legacy/blog-index.json';
import { img } from '../lib/images';

export interface Post {
  slug: string;
  path: string;
  title: string; // <title>
  description: string;
  h1: string;
  author: string;
  date: string; // as published, MM/DD/YYYY
  isoDate: string;
  lead: string;
  prose: string;
  /** Title as shown on the blog index card (differs from the post's <title>/H1 on some posts) */
  indexTitle: string;
  excerpt: string;
  readMore: string;
  cta: { title: string; text: string; button: string };
  image: ImageMetadata;
}

const photos = [img.res2, img.res4, img.res1, img.com2, img.van2, img.res3, img.com1, img.techUnloading, img.ownerPortrait, img.teamComposite];

const toIso = (d: string) => {
  const [m, day, y] = d.split('/');
  return `${y}-${m.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

/** Order matches the legacy blog index (newest first as published). */
export const posts: Post[] = (indexRaw as any).posts.map((p: any, i: number) => {
  const slug = p.href.replace('/blog/', '');
  const r = (postsRaw as any[]).find((x) => x.slug === slug);
  if (!r) throw new Error(`Missing legacy post ${slug}`);
  return {
    ...r,
    path: `/blog/${slug}`,
    isoDate: toIso(r.date),
    indexTitle: p.title,
    excerpt: p.excerpt,
    readMore: p.readMore,
    image: photos[i % photos.length],
  } as Post;
});

export const blogIndex = indexRaw as {
  title: string; description: string; h1: string; intro: string;
  cta: { title: string; text: string; button: string };
};
