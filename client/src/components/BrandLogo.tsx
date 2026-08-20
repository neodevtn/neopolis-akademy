import { cn } from "@/lib/utils";

export const OFFICIAL_NEOPOLIS_AKADEMY_LOGO = "/api/assets/neopolis-akademy-official-logo_40a16b6c.svg";

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
      width={180}
      height={63}
      decoding="async"
      className={cn("h-9 w-auto object-contain", className)}
    />
  );
}
