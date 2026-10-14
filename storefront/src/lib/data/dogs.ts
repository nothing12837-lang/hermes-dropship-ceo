/**
 * Curated real-dog photography (Unsplash CDN, already allowed in
 * next.config.mjs remotePatterns). Use via <DogImage/> so a gradient
 * fallback renders if a CDN id ever stops resolving.
 */

export interface DogPhoto {
  src: string;
  alt: string;
}

const u = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?q=80&w=${w}&auto=format&fit=crop`;

export const HERO_DOG: DogPhoto = {
  src: u('photo-1543466835-00a7907e9de1', 2000),
  alt: 'Happy dog jumping with joy',
};

export const DOG_PACK: DogPhoto[] = [
  { src: u('photo-1552053831-71594a27632d', 800), alt: 'Golden retriever smiling' },
  { src: u('photo-1583511655857-d19b40a7a54e', 800), alt: 'Pug puppy' },
  { src: u('photo-1548199973-03cce0bbc87b', 800), alt: 'Dogs running with a stick' },
  { src: u('photo-1537151625747-768eb6cf92b2', 800), alt: 'Dog in the park' },
  { src: u('photo-1587300003388-59208cc962cb', 800), alt: 'Dog with puppy' },
  { src: u('photo-1530281700549-e82e7bf110d6', 800), alt: 'Dog at sunset' },
];

export const SIDEKICK_DOG: DogPhoto = {
  src: u('photo-1548199973-03cce0bbc87b', 1200),
  alt: 'Dogs running and playing',
};
