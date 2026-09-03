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

  target.scrollIntoView({ block: "start", behavior: "auto" });
  return true;
}
