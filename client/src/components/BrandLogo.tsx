import { cn } from "@/lib/utils";

export const OFFICIAL_NEOPOLIS_AKADEMY_LOGO = "/api/assets/neopolis-akademy-official-logo_40a16b6c.svg";
export const NEOPOLIS_AKADEMY_HEADER_LOGO = "/api/assets/neopolis-akademy-header-120x42-rendered_e0ac12ce.png";

type BrandLogoProps = {
  className?: string;
  alt?: string;
};

/** Logo officiel unique de Neopolis Akademy. */
export function BrandLogo({ className, alt = "Neopolis Akademy" }: BrandLogoProps) {
  return (
    <img
      src={OFFICIAL_NEOPOLIS_AKADEMY_LOGO}
      alt={alt}
      width={120}
      height={42}
      decoding="sync"
      className={cn("h-[42px] w-[120px] shrink-0 object-contain", className)}
    />
  );
}

/** PNG officiel préparé à la taille native des en-têtes pour éviter tout redimensionnement navigateur. */
export function HeaderBrandLogo({ className, alt = "Neopolis Akademy" }: BrandLogoProps) {
  return (
    <img
      src={NEOPOLIS_AKADEMY_HEADER_LOGO}
      alt={alt}
      width={120}
      height={42}
      decoding="sync"
      draggable={false}
      className={cn("h-[42px] w-[120px] shrink-0 object-contain", className)}
    />
  );
}
