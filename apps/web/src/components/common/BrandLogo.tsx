import { ImgHTMLAttributes } from "react";
import logo from "@/assets/logo.png";
import { cn } from "@/utils/helpers";

type BrandSize = "favicon" | "sidebar-collapsed" | "sidebar" | "login";

interface BrandLogoProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "size"> {
  size?: BrandSize;
  showText?: boolean;
  darkMode?: "light" | "dark" | "auto";
}

const sizeMap: Record<BrandSize, { container: string; img: string; text: string }> = {
  favicon: {
    container: "flex items-center justify-center",
    img: "h-8 w-8",
    text: "",
  },
  "sidebar-collapsed": {
    container: "flex items-center justify-center",
    img: "h-8 w-8",
    text: "",
  },
  sidebar: {
    container: "flex items-center gap-3",
    img: "h-8 w-8",
    text: "text-lg font-bold tracking-tight",
  },
  login: {
    container: "flex flex-col items-center gap-3",
    img: "h-16 w-16",
    text: "text-2xl font-bold tracking-tight",
  },
};

export function BrandLogo({
  size = "sidebar",
  showText,
  darkMode = "auto",
  className,
  ...imgProps
}: BrandLogoProps) {
  const layout = sizeMap[size];
  const isCollapsed = size === "sidebar-collapsed";

  const resolvedShowText = showText !== undefined ? showText : !isCollapsed;

  const textColorClass =
    darkMode === "auto"
      ? "text-white"
      : darkMode === "dark"
        ? "text-white"
        : "text-gray-900";

  const subtextClass =
    darkMode === "auto"
      ? "text-gray-400"
      : darkMode === "dark"
        ? "text-gray-400"
        : "text-gray-500";

  return (
    <div className={cn(layout.container, className)}>
      <img
        src={logo}
        alt="Oryntal Estate"
        className={cn(
          layout.img,
          "shrink-0 object-contain",
          "[filter:brightness(1.1)_contrast(1.05)]",
          "dark:[filter:brightness(1.15)_contrast(1.1)_drop-shadow(0_0_6px_rgba(228,179,62,0.25))]"
        )}
        {...imgProps}
      />
      {resolvedShowText && (
        <div className="flex flex-col min-w-0">
          <span className={cn(layout.text, textColorClass, "truncate leading-tight")}>
            Oryntal Estate
          </span>
          {size === "login" && (
            <span className={cn("text-sm mt-0.5", subtextClass)}>
              Real Estate CRM
            </span>
          )}
        </div>
      )}
    </div>
  );
}
