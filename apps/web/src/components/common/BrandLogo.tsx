import { ImgHTMLAttributes } from "react";
import logo from "@/assets/logo.png";
import { cn } from "@/utils/helpers";

type BrandSize = "sm" | "md" | "lg";

interface BrandLogoProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "size"> {
  size?: BrandSize;
  showText?: boolean;
}

const sizeConfig: Record<BrandSize, { img: string; text: string; gap: string }> = {
  sm: {
    img: "h-8 w-8",
    text: "",
    gap: "",
  },
  md: {
    img: "h-8 w-8",
    text: "text-lg font-bold tracking-tight",
    gap: "gap-3",
  },
  lg: {
    img: "h-16 w-16",
    text: "text-2xl font-bold tracking-tight",
    gap: "gap-3",
  },
};

export function BrandLogo({
  size = "md",
  showText,
  className,
  ...imgProps
}: BrandLogoProps) {
  const config = sizeConfig[size];
  const resolvedShowText = showText ?? size !== "sm";

  return (
    <div className={cn("flex items-center", config.gap, className)}>
      <img
        src={logo}
        alt="Oryntal Estate"
        className={cn(
          config.img,
          "shrink-0 object-contain",
          "drop-shadow-[0_0_6px_rgba(245,158,11,0.25)]"
        )}
        {...imgProps}
      />
      {resolvedShowText && (
        <div className="flex flex-col min-w-0">
          <span className={cn(config.text, "bg-gold-gradient bg-clip-text text-transparent truncate leading-tight")}>
            Oryntal Estate
          </span>
          {size === "lg" && (
            <span className="text-sm text-dark-400 mt-0.5">
              Real Estate CRM
            </span>
          )}
        </div>
      )}
    </div>
  );
}
