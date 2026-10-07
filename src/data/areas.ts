import raw from './legacy/areas.json';
import { img } from '../lib/images';
import { slugToName } from '../lib/text';

export interface Area {
  slug: string;
  path: string;
  name: string;
  title: string;
  description: string;
  h1: string;
  subtitle: string;
  prose: string;
  whyHeading: string;
  why: { title: string; text: string }[];
  coverage: { title: string; text: string };
  cta: { title: string; text: string };
  infoTitle: string;
  infoRows: { label: string; value: string }[];
  servicesHeading: string;
  serviceLinks: { label: string; href: string }[];
  map: { title: string; subtitle: string; iframe: string; contact: string[] };
  nearbyTitle: string;
  nearbyLinks: { label: string; href: string }[];
  viewAllLabel: string;
  image: ImageMetadata;
}

// Legacy neighbourhood order (as listed on the old homepage)
const order = [
  'settlers-ridge', 'highland-park', 'lakeside-at-blackhawk', 'gatlin-creek', 'willow-creek', 'spring-trails',
  'avalon', 'falcon-pointe', 'heatherwilde', 'blackhawk', 'mountain-creek', 'brookfield-estates', 'windermere',
  "sarah's-creek", 'commons-at-rowe-lane',
].map((s) => `${s}-78660`);

const photoCycle = [img.res1, img.res4, img.res3, img.res2, img.van1, img.teamComposite, img.van2, img.ownerPortrait];

export const areas: Area[] = order.map((slug, i) => {
  const r = (raw as any[]).find((x) => x.slug === slug);
  if (!r) throw new Error(`Missing legacy area ${slug}`);
  return {
    ...r,
    path: `/service-area/${slug}`,
    name: slugToName(slug),
    image: photoCycle[i % photoCycle.length],
  } as Area;
});

export const areaBySlug = (slug: string) => areas.find((a) => a.slug === slug)!;
