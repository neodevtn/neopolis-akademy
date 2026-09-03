import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * Les pages thématiques sont rendues directement par Express afin que les
 * visiteurs et les moteurs de recherche reçoivent le même contenu indexable.
 * Après une navigation Wouter depuis l’accueil, ce relais recharge l’URL
 * courante pour servir ce rendu canonique plutôt qu’une version client réduite.
 */
export default function PublicTrainingThemes() {
  const [location] = useLocation();

  useEffect(() => {
    window.location.assign(location);
  }, [location]);

  return <main className="min-h-screen bg-background" aria-live="polite" aria-busy="true" />;
}
