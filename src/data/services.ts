import raw from './legacy/services.json';
import { img } from '../lib/images';
import { shortLabel } from '../lib/text';
/** Exact service names as the legacy navigation spelled them, e.g. "Roof Repair Pflugerville TX". */
import navNames from './legacy/service-names.json';

export type ServiceCategory = 'Roofing' | 'Gutters' | 'Specialty' | 'Inspections';

export interface FaqItem { q: string; a: string }
export interface TitledItem { title: string; text: string }

export interface Service {
  slug: string;
  path: string;
  title: string; // <title>
  description: string;
  h1: string;
  subtitle: string;
  prose: string;
  benefitsHeading: string;
  benefits: TitledItem[];
  processHeading: string;
  process: TitledItem[];
  cta: { title: string; text: string };
  areasCard: { title: string; text: string; links: { label: string; href: string }[] };
  faqHeading: string;
  faq: FaqItem[];
  faqClosing: { text: string; button: string };
  map: { title: string; subtitle: string; iframe: string; contact: string[] };
  // presentation (new design)
  name: string; // exact service name as on the old site, e.g. "Roof Repair Pflugerville TX"
  label: string; // short label for tight UI
  category: ServiceCategory;
  icon: string;
  image: ImageMetadata;
  imageAlt: string;
}

interface Meta { category: ServiceCategory; icon: string; image: ImageMetadata; alt: string }

/** Presentation metadata only — all copy comes from the legacy content. */
const meta: Record<string, Meta> = {
  'roof-installation-pflugerville-tx': { category: 'Roofing', icon: 'hammer', image: img.res3, alt: 'Roofer carrying shingles during a roof installation in Pflugerville' },
  'roof-repair-pflugerville-tx': { category: 'Roofing', icon: 'wrench', image: img.res2, alt: 'Roofer hammering new shingles during a roof repair' },
  'emergency-roof-repair-pflugerville-tx': { category: 'Roofing', icon: 'siren', image: img.van2, alt: 'Pflugerville Roof Experts emergency van responding on a residential street' },
  'roof-leak-repair-pflugerville-tx': { category: 'Roofing', icon: 'droplets', image: img.res1, alt: 'Roofer working on a Pflugerville home roof from a ladder' },
  'flat-roof-repair-pflugerville-tx': { category: 'Roofing', icon: 'layers', image: img.com2, alt: 'Technician heat-welding a flat roof membrane seam' },
  'residential-roofing-pflugerville-tx': { category: 'Roofing', icon: 'house', image: img.res4, alt: 'Pflugerville Roof Experts roofer outside a finished residential roof' },
  'commercial-roofing-pflugerville-tx': { category: 'Roofing', icon: 'building-2', image: img.com1, alt: 'Roofing crew working on a large commercial flat roof' },
  'metal-roof-installation-pflugerville-tx': { category: 'Roofing', icon: 'warehouse', image: img.ba3, alt: 'Before and after of a commercial building re-roofed with a new metal roof' },
  'gutter-repair-and-replacement-pflugerville-tx': { category: 'Gutters', icon: 'cloud-rain', image: img.techUnloading, alt: 'Technician unloading ladders and materials for a gutter job' },
  'gutter-installation-pflugerville-tx': { category: 'Gutters', icon: 'cloud-rain', image: img.van1, alt: 'Pflugerville Roof Experts van arriving at a home for gutter work' },
  'seamless-gutter-installation-pflugerville-tx': { category: 'Gutters', icon: 'droplet', image: img.res1, alt: 'Roofing professional on a ladder at a Pflugerville home' },
  'rain-gutter-repair-pflugerville-tx': { category: 'Gutters', icon: 'droplets', image: img.ownerPortrait, alt: 'Pflugerville Roof Experts owner with a loaded work truck' },
  'rain-gutter-installation-pflugerville-tx': { category: 'Gutters', icon: 'cloud-rain', image: img.teamComposite, alt: 'Pflugerville Roof Experts crew ready for a gutter and roofing install' },
  'skylight-installation-and-repair-pflugerville-tx': { category: 'Specialty', icon: 'sun', image: img.ba1, alt: 'Before and after of a water-stained ceiling replaced with a bright new skylight' },
  'attic-ventilation-installation-pflugerville-tx': { category: 'Specialty', icon: 'wind', image: img.ba4, alt: 'Before and after of a warehouse roof deck with new skylights and ventilation' },
  'attic-ventilation-services-pflugerville-tx': { category: 'Specialty', icon: 'wind', image: img.com3, alt: 'Technician servicing rooftop ventilation equipment' },
  'solar-panel-roof-installation-pflugerville-tx': { category: 'Specialty', icon: 'zap', image: img.com4, alt: 'Roofing team reviewing plans on a flat roof before installation' },
  'chimney-flashing-repair-pflugerville-tx': { category: 'Specialty', icon: 'flame', image: img.res2, alt: 'Close-up of a roofer sealing shingles and flashing' },
  'storm-damage-roof-inspection-pflugerville-tx': { category: 'Inspections', icon: 'cloud-lightning', image: img.ba2, alt: 'Before and after of a storm-damaged residential roof and the finished replacement' },
  'roof-inspections-for-real-estate-transactions-pflugerville-tx': { category: 'Inspections', icon: 'clipboard-check', image: img.com4, alt: 'Inspectors reviewing a roof plan on site' },
};

const order = [
  // Same order as the legacy navigation
  'roof-installation-pflugerville-tx', 'roof-repair-pflugerville-tx', 'emergency-roof-repair-pflugerville-tx',
  'roof-leak-repair-pflugerville-tx', 'flat-roof-repair-pflugerville-tx', 'residential-roofing-pflugerville-tx',
  'commercial-roofing-pflugerville-tx', 'metal-roof-installation-pflugerville-tx',
  'gutter-repair-and-replacement-pflugerville-tx', 'gutter-installation-pflugerville-tx',
  'seamless-gutter-installation-pflugerville-tx', 'rain-gutter-repair-pflugerville-tx',
  'rain-gutter-installation-pflugerville-tx', 'skylight-installation-and-repair-pflugerville-tx',
  'attic-ventilation-installation-pflugerville-tx', 'solar-panel-roof-installation-pflugerville-tx',
  'chimney-flashing-repair-pflugerville-tx', 'attic-ventilation-services-pflugerville-tx',
  'storm-damage-roof-inspection-pflugerville-tx', 'roof-inspections-for-real-estate-transactions-pflugerville-tx',
];


export const services: Service[] = order.map((slug) => {
  const r = (raw as any[]).find((x) => x.slug === slug);
  if (!r) throw new Error(`Missing legacy service ${slug}`);
  const m = meta[slug];
  if (!m) throw new Error(`Missing presentation meta for ${slug}`);
  const name = (navNames as Record<string, string>)[slug];
  if (!name) throw new Error(`Missing nav name for ${slug}`);
  return {
    ...r,
    path: `/services/${slug}`,
    name,
    label: shortLabel(name),
    category: m.category,
    icon: m.icon,
    image: m.image,
    imageAlt: m.alt,
  } as Service;
});

export const serviceBySlug = (slug: string) => services.find((s) => s.slug === slug)!;
export const categories: ServiceCategory[] = ['Roofing', 'Gutters', 'Specialty', 'Inspections'];
export const servicesIn = (c: ServiceCategory) => services.filter((s) => s.category === c);
