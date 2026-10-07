/**
 * Single source of truth for business identity. Change values here and every page,
 * schema block, sitemap and llms.txt picks them up on the next build.
 */
const env = import.meta.env;

const siteUrl = (env.PUBLIC_SITE_URL || 'https://www.pflugervilleroofexperts.com').replace(/\/$/, '');

export const site = {
  name: 'Pflugerville Roof Experts',
  shortName: 'Pflugerville Roof Experts',
  url: siteUrl,
  /** Apex used for the per-state sites: https://{code}.pflugervilleroofexperts.com */
  baseDomain: 'pflugervilleroofexperts.com',
  tagline: 'Licensed & Insured',
  phone: {
    display: '(512) 877-2577',
    e164: '+15128772577',
    href: 'tel:+15128772577',
  },
  email: 'info@pflugervilleroofexperts.com',
  address: {
    street: '1801 Maple Vista Dr',
    city: 'Pflugerville',
    region: 'TX',
    postalCode: '78660',
    country: 'US',
    /** Full line exactly as supplied by the owner */
    full: '1801 Maple Vista Dr, Pflugerville, TX 78660, USA',
  },
  hours: {
    lines: ['Mon-Fri: 8AM-6PM', 'Sat: 8AM-4PM', '24/7 Emergency'],
    /** schema.org openingHoursSpecification */
    spec: [
      { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '08:00', closes: '18:00' },
      { days: ['Saturday'], opens: '08:00', closes: '16:00' },
    ],
  },
  /** Google Analytics / Tag Manager ids come from environment variables (see .env.example). */
  analytics: {
    gaId: String(env.PUBLIC_GA_MEASUREMENT_ID || '').trim(),
    gtmId: String(env.PUBLIC_GTM_ID || '').trim(),
  },
  /**
   * The media pack includes a "verified customer" review-card graphic. The previous website did not
   * publish customer reviews, so it stays off until it is replaced with a real, attributable review.
   */
  showReviewCardGraphic: false,
} as const;

export const abs = (path: string) => (path.startsWith('http') ? path : `${site.url}${path.startsWith('/') ? path : `/${path}`}`);
export const stateUrl = (code: string) => `https://${code}.${site.baseDomain}/`;
export const mapEmbed = (query: string, zoom = 14) =>
  `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`;
