// Central registry for the media pack. Swap an import here to change a photo site-wide.
import logo from '../assets/brand/logo-lockup.png';
import shield from '../assets/brand/shield.png';
import badgeShield from '../assets/brand/trust-badge-shield.webp';
import badgeRound from '../assets/brand/trust-badge-round.webp';
import handshake from '../assets/brand/overlay-handshake.webp';
import reviewCard from '../assets/brand/overlay-review-card.webp';

import businessExterior from '../assets/authority/business-exterior.webp';
import ownerPortrait from '../assets/authority/owner-portrait.webp';
import teamComposite from '../assets/authority/team-composite.webp';
import workspaceInterior from '../assets/authority/workspace-interior.webp';

import van1 from '../assets/field/branded-van-1.webp';
import van2 from '../assets/field/branded-van-2.webp';
import techUnloading from '../assets/field/technician-unloading.webp';

import res1 from '../assets/service/residential-1.webp';
import res2 from '../assets/service/residential-2.webp';
import res3 from '../assets/service/residential-3.webp';
import res4 from '../assets/service/residential-4.webp';
import com1 from '../assets/service/commercial-1.webp';
import com2 from '../assets/service/commercial-2.webp';
import com3 from '../assets/service/commercial-3.webp';
import com4 from '../assets/service/commercial-4.webp';

import ba1 from '../assets/before-after/before-after-1.webp';
import ba2 from '../assets/before-after/before-after-2.webp';
import ba3 from '../assets/before-after/before-after-3.webp';
import ba4 from '../assets/before-after/before-after-4.webp';

import headerBg from '../assets/backgrounds/header-bg.webp';
import footerBg from '../assets/backgrounds/footer-bg.webp';

export const img = {
  logo, shield, badgeShield, badgeRound, handshake, reviewCard,
  businessExterior, ownerPortrait, teamComposite, workspaceInterior,
  van1, van2, techUnloading,
  res1, res2, res3, res4, com1, com2, com3, com4,
  ba1, ba2, ba3, ba4,
  headerBg, footerBg,
};

export interface Photo {
  src: ImageMetadata;
  alt: string;
}

export const photos = {
  team: { src: teamComposite, alt: 'Pflugerville Roof Experts roofing crew standing in front of a home roof replacement project' },
  exterior: { src: businessExterior, alt: 'Pflugerville Roof Experts office and branded service truck in Pflugerville, TX' },
  owner: { src: ownerPortrait, alt: 'Pflugerville Roof Experts owner beside a branded work truck loaded with roofing materials' },
  workspace: { src: workspaceInterior, alt: 'Pflugerville Roof Experts office and warehouse where roofing jobs are scheduled' },
  van1: { src: van1, alt: 'Pflugerville Roof Experts branded roofing van parked on a Pflugerville street' },
  van2: { src: van2, alt: 'Pflugerville Roof Experts emergency roofing van on a residential street' },
  unloading: { src: techUnloading, alt: 'Roofing technician unloading materials from a Pflugerville Roof Experts van' },
  handshake: { src: handshake, alt: 'Pflugerville Roof Experts technician shaking hands with a homeowner at the front door' },
} satisfies Record<string, Photo>;
