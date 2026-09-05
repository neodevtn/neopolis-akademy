export const homePublicAnchorIds = ["formule", "pourquoi", "partenaires", "faq"] as const;

export type HomePublicAnchorId = (typeof homePublicAnchorIds)[number];

export function isHomePublicAnchor(value: string): value is HomePublicAnchorId {
  return homePublicAnchorIds.some((anchor) => anchor === value);
}

/**
 * Rejoue le déplacement vers une ancre après le montage de l'accueil SPA.
 * Sans cela, un navigateur peut résoudre `/#formule` avant que React ait
 * inséré la section correspondante dans le DOM.
 */
export function scrollToHomePublicAnchor(hash: string) {
  const anchor = decodeURIComponent(hash.replace(/^#/, ""));
  if (!isHomePublicAnchor(anchor)) return false;

  const target = document.getElementById(anchor);
  if (!target) return false;

  const header = document.querySelector<HTMLElement>(".public-chrome-header");
  const headerOffset = Math.max(16, Math.ceil(header?.getBoundingClientRect().height ?? 64));
  const targetTop = target.getBoundingClientRect().top + window.scrollY - headerOffset;
  window.scrollTo({ top: Math.max(0, targetTop), behavior: "auto" });
  return true;
}

type HomeAnchorNavigation = {
  currentHash?: string;
  updateHash?: (hash: string) => void;
  scroll?: (hash: string) => boolean;
};

export function navigateToHomePublicAnchor(hash: string, navigation: HomeAnchorNavigation = {}) {
  const normalizedHash = hash.startsWith("#") ? hash : `#${hash}`;
  const anchor = decodeURIComponent(normalizedHash.slice(1));
  if (!isHomePublicAnchor(anchor)) return false;

  const currentHash = navigation.currentHash ?? window.location.hash;
  const updateHash = navigation.updateHash ?? ((nextHash: string) => window.history.pushState(null, "", nextHash));
  const scroll = navigation.scroll ?? scrollToHomePublicAnchor;
  if (currentHash !== normalizedHash) updateHash(normalizedHash);
  return scroll(normalizedHash);
}
