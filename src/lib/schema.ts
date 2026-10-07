import { site, abs, stateUrl } from '../config/site';
import { services } from '../data/services';
import { areas } from '../data/areas';
import { states } from '../data/states';

export const ids = {
  business: `${site.url}/#business`,
  website: `${site.url}/#website`,
};

const place = (name: string) => ({
  '@type': 'Place',
  name: `${name}, Pflugerville, TX`,
  containedInPlace: { '@type': 'City', name: 'Pflugerville', containedInPlace: { '@type': 'State', name: 'Texas' } },
});

const address = {
  '@type': 'PostalAddress',
  streetAddress: site.address.street,
  addressLocality: site.address.city,
  addressRegion: site.address.region,
  postalCode: site.address.postalCode,
  addressCountry: site.address.country,
};

/** The business entity. `full` adds the service catalogue and every state sub-site (home page only). */
export function businessNode(full = false) {
  const node: Record<string, unknown> = {
    '@type': 'RoofingContractor',
    '@id': ids.business,
    name: site.name,
    url: `${site.url}/`,
    telephone: site.phone.e164,
    email: site.email,
    priceRange: '$$',
    image: abs('/og-default.jpg'),
    logo: { '@type': 'ImageObject', url: abs('/logo.png'), width: 512, height: 512 },
    address,
    hasMap: `https://www.google.com/maps?q=${encodeURIComponent(site.address.full)}`,
    openingHoursSpecification: site.hours.spec.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    })),
    areaServed: [
      { '@type': 'City', name: 'Pflugerville', containedInPlace: { '@type': 'State', name: 'Texas' } },
      ...areas.map((a) => place(a.name)),
    ],
  };
  if (full) {
    (node.areaServed as unknown[]).push(
      ...states.map((s) => ({ '@type': s.code === 'pr' ? 'Country' : 'State', name: s.name, url: stateUrl(s.code) })),
    );
    node.hasOfferCatalog = {
      '@type': 'OfferCatalog',
      name: 'Roofing services in Pflugerville, TX',
      itemListElement: services.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.name, url: abs(s.path) },
      })),
    };
    node.knowsAbout = services.map((s) => s.name);
  }
  return node;
}

export const websiteNode = () => ({
  '@type': 'WebSite',
  '@id': ids.website,
  url: `${site.url}/`,
  name: site.name,
  inLanguage: 'en-US',
  publisher: { '@id': ids.business },
});

export interface Crumb { name: string; path: string }

export const breadcrumbNode = (path: string, crumbs: Crumb[]) => ({
  '@type': 'BreadcrumbList',
  '@id': `${abs(path)}#breadcrumb`,
  itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: abs(c.path) })),
});

export const webPageNode = (opts: {
  path: string; name: string; description: string; type?: string; image?: string; breadcrumb?: boolean; extra?: Record<string, unknown>;
}) => ({
  '@type': opts.type ?? 'WebPage',
  '@id': `${abs(opts.path)}#webpage`,
  url: abs(opts.path),
  name: opts.name,
  description: opts.description,
  inLanguage: 'en-US',
  isPartOf: { '@id': ids.website },
  about: { '@id': ids.business },
  ...(opts.image ? { primaryImageOfPage: { '@type': 'ImageObject', url: opts.image } } : {}),
  ...(opts.breadcrumb ? { breadcrumb: { '@id': `${abs(opts.path)}#breadcrumb` } } : {}),
  ...(opts.extra ?? {}),
});

export const faqNode = (path: string, faq: { q: string; a: string }[]) => ({
  '@type': 'FAQPage',
  '@id': `${abs(path)}#faq`,
  mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});

export const graph = (...nodes: unknown[]) => ({ '@context': 'https://schema.org', '@graph': nodes.filter(Boolean) });
