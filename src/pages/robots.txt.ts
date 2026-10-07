import type { APIRoute } from 'astro';
import { abs } from '../config/site';

// Search engines and AI/answer-engine crawlers are explicitly welcome.
const aiBots = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'Claude-SearchBot', 'anthropic-ai',
  'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'Bingbot', 'DuckAssistBot',
  'cohere-ai', 'MistralAI-User', 'Amazonbot', 'meta-externalagent',
];

export const GET: APIRoute = () => {
  const body = `# ${abs('/')}
User-agent: *
Allow: /

# Block common bot traps
Disallow: /cgi-bin/
Disallow: /wp-admin/
Disallow: /admin/
Disallow: /*.php$

${aiBots.map((b) => `User-agent: ${b}\nAllow: /`).join('\n\n')}

Sitemap: ${abs('/sitemap.xml')}
Sitemap: ${abs('/sitemap-index.xml')}

# LLM-friendly site summary: ${abs('/llms.txt')}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
