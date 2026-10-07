export type Region = 'Northeast' | 'Midwest' | 'South' | 'West' | 'Territories';

export interface State {
  code: string; // lowercase subdomain, e.g. "tx"
  name: string;
  region: Region;
  /** Whether {code}.pflugervilleroofexperts.com/sitemap.xml is listed in sitemap-index.xml */
  sitemap: boolean;
}

const s = (code: string, name: string, region: Region, sitemap = true): State => ({ code, name, region, sitemap });

/**
 * All 50 states + DC + Puerto Rico. The 47 entries below with sitemap=true are the ones the legacy
 * jncroofing.com sitemap index listed; AZ, DE, HI, NV and UT are new (linked from every page) —
 * flip `sitemap` to true once their subdomain sitemaps are live.
 */
export const states: State[] = [
  // Northeast
  s('ct', 'Connecticut', 'Northeast'), s('me', 'Maine', 'Northeast'), s('ma', 'Massachusetts', 'Northeast'),
  s('nh', 'New Hampshire', 'Northeast'), s('nj', 'New Jersey', 'Northeast'), s('ny', 'New York', 'Northeast'),
  s('pa', 'Pennsylvania', 'Northeast'), s('ri', 'Rhode Island', 'Northeast'), s('vt', 'Vermont', 'Northeast'),
  // Midwest
  s('il', 'Illinois', 'Midwest'), s('in', 'Indiana', 'Midwest'), s('ia', 'Iowa', 'Midwest'), s('ks', 'Kansas', 'Midwest'),
  s('mi', 'Michigan', 'Midwest'), s('mn', 'Minnesota', 'Midwest'), s('mo', 'Missouri', 'Midwest'),
  s('ne', 'Nebraska', 'Midwest'), s('nd', 'North Dakota', 'Midwest'), s('oh', 'Ohio', 'Midwest'),
  s('sd', 'South Dakota', 'Midwest'), s('wi', 'Wisconsin', 'Midwest'),
  // South
  s('al', 'Alabama', 'South'), s('ar', 'Arkansas', 'South'), s('de', 'Delaware', 'South', false),
  s('dc', 'Washington DC', 'South'), s('fl', 'Florida', 'South'), s('ga', 'Georgia', 'South'),
  s('ky', 'Kentucky', 'South'), s('la', 'Louisiana', 'South'), s('md', 'Maryland', 'South'),
  s('ms', 'Mississippi', 'South'), s('nc', 'North Carolina', 'South'), s('ok', 'Oklahoma', 'South'),
  s('sc', 'South Carolina', 'South'), s('tn', 'Tennessee', 'South'), s('tx', 'Texas', 'South'),
  s('va', 'Virginia', 'South'), s('wv', 'West Virginia', 'South'),
  // West
  s('ak', 'Alaska', 'West'), s('az', 'Arizona', 'West', false), s('ca', 'California', 'West'),
  s('co', 'Colorado', 'West'), s('hi', 'Hawaii', 'West', false), s('id', 'Idaho', 'West'),
  s('mt', 'Montana', 'West'), s('nv', 'Nevada', 'West', false), s('nm', 'New Mexico', 'West'),
  s('or', 'Oregon', 'West'), s('ut', 'Utah', 'West', false), s('wa', 'Washington', 'West'), s('wy', 'Wyoming', 'West'),
  // Territories
  s('pr', 'Puerto Rico', 'Territories'),
];

export const regions: Region[] = ['South', 'West', 'Midwest', 'Northeast', 'Territories'];
export const statesByRegion = (r: Region) => states.filter((x) => x.region === r);
