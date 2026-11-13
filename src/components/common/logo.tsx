
import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  compact?: boolean;
  showName?: boolean;
  href?: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export default function Logo({
  compact = false,
  showName = true,
  href = "/",
  width,
  height,
  className = "",
  priority = false,
}: LogoProps) {
  const logoWidth = width ?? (compact ? 56 : 100);
  const logoHeight = height ?? (compact ? 56 : 100);

  return (
    <Link
      href={href}
      aria-label="LCC Institute Home"
      className={`flex shrink-0 items-center gap-3 ${className}`}
    >
      <Image
        src="/images/LCC-logo.webp"
        alt="LCC Institute"
        width={logoWidth}
        height={logoHeight}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        sizes={`${logoWidth}px`}
        className="rounded-full object-contain"
      />

      {showName && (
        <div className="flex flex-col">
          <span className="whitespace-nowrap text-lg font-bold tracking-tight text-[#171717] sm:text-xl lg:text-3xl">
            LCC Institute
          </span>

          <span className="whitespace-nowrap text-xs font-medium text-gray-600 sm:text-sm lg:text-base">
            Learn Competition Classes
          </span>
        </div>
      )}
    </Link>
  );
}
