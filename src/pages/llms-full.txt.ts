import type { APIRoute } from 'astro';
import { abs, site } from '../config/site';
import { services } from '../data/services';
import { areas } from '../data/areas';
import { posts } from '../data/blog';
import home from '../data/legacy/home.json';
import { htmlToMd, decode } from '../lib/text';

export const GET: APIRoute = () => {
  const base = site.url;
  const out: string[] = [`# ${site.name} — full site text`, '', `Source: ${abs('/')}  ·  Phone ${site.phone.display}  ·  ${site.email}  ·  ${site.address.full}`, ''];

  out.push(`---\n\n# ${home.title}\nURL: ${abs('/')}\n\n${home.hero.h1}\n\n${home.hero.subtitle}\n\n${htmlToMd(home.about.prose, base)}\n`);

  for (const s of services) {
    out.push(
      `---\n\n# ${s.h1}\nURL: ${abs(s.path)}\n\n${s.subtitle}\n\n${htmlToMd(s.prose, base)}\n\n## ${s.benefitsHeading}\n${s.benefits.map((b) => `- ${b.title}`).join('\n')}\n\n## ${s.processHeading}\n${s.process.map((p, i) => `${i + 1}. ${p.title}`).join('\n')}\n\n## ${s.faqHeading}\n${s.faq.map((f) => `**${f.q}**\n${f.a}`).join('\n\n')}\n`,
    );
  }
  for (const a of areas) {
    out.push(
      `---\n\n# ${a.h1}\nURL: ${abs(a.path)}\n\n${a.subtitle}\n\n${htmlToMd(a.prose, base)}\n\n## ${a.whyHeading}\n${a.why.map((w) => `- ${w.title}: ${w.text}`).join('\n')}\n\n## ${a.coverage.title}\n${a.coverage.text}\n\n${a.infoTitle}: ${a.infoRows.map((r) => `${r.label} ${r.value}`).join('; ')}\n`,
    );
  }
  for (const p of posts) {
    out.push(`---\n\n# ${p.h1}\nURL: ${abs(p.path)}\nPublished: ${p.date} · ${p.author}\n\n${p.lead}\n\n${htmlToMd(p.prose, base)}\n`);
  }
  return new Response(decode(out.join('\n')), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
