import type { APIRoute } from 'astro';
import { abs, site, stateUrl } from '../config/site';
import { services, categories, servicesIn } from '../data/services';
import { areas } from '../data/areas';
import { posts } from '../data/blog';
import { states } from '../data/states';

export const GET: APIRoute = () => {
  const lines: string[] = [
    `# ${site.name}`,
    '',
    `> ${site.name} is a licensed and insured roofing contractor in Pflugerville, TX 78660 offering roof installation, roof repair, emergency roof repair, leak repair, flat and metal roofing, gutters, skylights, attic ventilation, chimney flashing and storm-damage inspections for homes and businesses, with 24/7 emergency service. Local sites cover every U.S. state.`,
    '',
    '## Business details',
    `- Name: ${site.name}`,
    `- Phone: ${site.phone.display}`,
    `- Email: ${site.email}`,
    `- Address: ${site.address.full}`,
    `- Hours: ${site.hours.lines.join('; ')}`,
    `- Website: ${abs('/')}`,
    '',
    '## Services',
    ...categories.flatMap((c) => [`### ${c}`, ...servicesIn(c).map((s) => `- [${s.name}](${abs(s.path)}): ${s.description}`)]),
    '',
    '## Pflugerville neighborhoods served (zip 78660)',
    ...areas.map((a) => `- [${a.name}](${abs(a.path)})`),
    '',
    '## Blog',
    `- [Blog index](${abs('/blog/')})`,
    ...posts.map((p) => `- [${p.indexTitle}](${abs(p.path)}) — ${p.date}`),
    '',
    '## Nationwide coverage (state sites)',
    ...states.map((s) => `- [${s.name}](${stateUrl(s.code)})`),
    '',
    '## Optional',
    `- [Full text of every page](${abs('/llms-full.txt')})`,
    `- [Sitemap](${abs('/sitemap.xml')})`,
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
