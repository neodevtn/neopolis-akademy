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
      width={120}
      height={42}
      decoding="sync"
      className={cn("h-[42px] w-[120px] shrink-0 object-contain", className)}
    />
  );
}
