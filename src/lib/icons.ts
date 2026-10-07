// Explicit lucide imports keep the build graph small (only these icons are bundled).
import phone from 'lucide-static/icons/phone.svg?raw';
import mail from 'lucide-static/icons/mail.svg?raw';
import mapPin from 'lucide-static/icons/map-pin.svg?raw';
import clock from 'lucide-static/icons/clock.svg?raw';
import shieldCheck from 'lucide-static/icons/shield-check.svg?raw';
import award from 'lucide-static/icons/award.svg?raw';
import star from 'lucide-static/icons/star.svg?raw';
import check from 'lucide-static/icons/check.svg?raw';
import chevronDown from 'lucide-static/icons/chevron-down.svg?raw';
import menu from 'lucide-static/icons/menu.svg?raw';
import x from 'lucide-static/icons/x.svg?raw';
import arrowRight from 'lucide-static/icons/arrow-right.svg?raw';
import arrowUpRight from 'lucide-static/icons/arrow-up-right.svg?raw';
import search from 'lucide-static/icons/search.svg?raw';
import users from 'lucide-static/icons/users.svg?raw';
import handshake from 'lucide-static/icons/handshake.svg?raw';
import badgeCheck from 'lucide-static/icons/badge-check.svg?raw';
import calendarDays from 'lucide-static/icons/calendar-days.svg?raw';
import fileText from 'lucide-static/icons/file-text.svg?raw';
import circleHelp from 'lucide-static/icons/circle-help.svg?raw';
import plus from 'lucide-static/icons/plus.svg?raw';
import minus from 'lucide-static/icons/minus.svg?raw';
import quote from 'lucide-static/icons/quote.svg?raw';
import globe from 'lucide-static/icons/globe.svg?raw';
import truck from 'lucide-static/icons/truck.svg?raw';
import hardHat from 'lucide-static/icons/hard-hat.svg?raw';
import sparkles from 'lucide-static/icons/sparkles.svg?raw';
import thumbsUp from 'lucide-static/icons/thumbs-up.svg?raw';
import ruler from 'lucide-static/icons/ruler.svg?raw';
import map from 'lucide-static/icons/map.svg?raw';
import shield from 'lucide-static/icons/shield.svg?raw';
import house from 'lucide-static/icons/house.svg?raw';
import building2 from 'lucide-static/icons/building-2.svg?raw';
import hammer from 'lucide-static/icons/hammer.svg?raw';
import wrench from 'lucide-static/icons/wrench.svg?raw';
import siren from 'lucide-static/icons/siren.svg?raw';
import droplets from 'lucide-static/icons/droplets.svg?raw';
import droplet from 'lucide-static/icons/droplet.svg?raw';
import layers from 'lucide-static/icons/layers.svg?raw';
import warehouse from 'lucide-static/icons/warehouse.svg?raw';
import cloudRain from 'lucide-static/icons/cloud-rain.svg?raw';
import sun from 'lucide-static/icons/sun.svg?raw';
import wind from 'lucide-static/icons/wind.svg?raw';
import zap from 'lucide-static/icons/zap.svg?raw';
import flame from 'lucide-static/icons/flame.svg?raw';
import cloudLightning from 'lucide-static/icons/cloud-lightning.svg?raw';
import clipboardCheck from 'lucide-static/icons/clipboard-check.svg?raw';
import navigation from 'lucide-static/icons/navigation.svg?raw';
import locateFixed from 'lucide-static/icons/locate-fixed.svg?raw';
import arrowLeft from 'lucide-static/icons/arrow-left.svg?raw';
import newspaper from 'lucide-static/icons/newspaper.svg?raw';
import userRound from 'lucide-static/icons/user-round.svg?raw';

const raw: Record<string, string> = {
  'phone': phone,
  'mail': mail,
  'map-pin': mapPin,
  'clock': clock,
  'shield-check': shieldCheck,
  'award': award,
  'star': star,
  'check': check,
  'chevron-down': chevronDown,
  'menu': menu,
  'x': x,
  'arrow-right': arrowRight,
  'arrow-up-right': arrowUpRight,
  'search': search,
  'users': users,
  'handshake': handshake,
  'badge-check': badgeCheck,
  'calendar-days': calendarDays,
  'file-text': fileText,
  'circle-help': circleHelp,
  'plus': plus,
  'minus': minus,
  'quote': quote,
  'globe': globe,
  'truck': truck,
  'hard-hat': hardHat,
  'sparkles': sparkles,
  'thumbs-up': thumbsUp,
  'ruler': ruler,
  'map': map,
  'shield': shield,
  'house': house,
  'building-2': building2,
  'hammer': hammer,
  'wrench': wrench,
  'siren': siren,
  'droplets': droplets,
  'droplet': droplet,
  'layers': layers,
  'warehouse': warehouse,
  'cloud-rain': cloudRain,
  'sun': sun,
  'wind': wind,
  'zap': zap,
  'flame': flame,
  'cloud-lightning': cloudLightning,
  'clipboard-check': clipboardCheck,
  'navigation': navigation,
  'locate-fixed': locateFixed,
  'arrow-left': arrowLeft,
  'newspaper': newspaper,
  'user-round': userRound,
};

/** Inner SVG markup (paths only) for a lucide icon. */
const cache = new Map<string, string>();
export function iconMarkup(name: string): string {
  const hit = cache.get(name);
  if (hit) return hit;
  const src = raw[name];
  if (!src) throw new Error(`Unknown icon "${name}" — add it to src/lib/icons.ts`);
  const inner = src.replace(/<!--[\s\S]*?-->/g, '').replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').trim();
  cache.set(name, inner);
  return inner;
}
