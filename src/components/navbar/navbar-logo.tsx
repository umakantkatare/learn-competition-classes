import Image from "next/image";
import Link from "next/link";

interface NavbarLogoProps {
  compact?: boolean;
}

export default function NavbarLogo({ compact = false }: NavbarLogoProps) {
  return (
    <Link
      href="/"
      aria-label="LCC Institute Home"
      className="
        group flex shrink-0 items-center
        gap-2 sm:gap-3
        rounded-lg outline-none
        focus-visible:ring-2
        focus-visible:ring-ring
        focus-visible:ring-offset-2
      "
    >
      {/* Institute Logo */}
      <div
        className={`
          relative shrink-0 overflow-hidden
          ${compact ? "size-10 sm:size-12" : "size-12 sm:size-14 lg:size-16"}
        `}
      >
        <Image
          src="/images/LCC-logo.webp"
          alt="LCC Institute Logo"
          fill
          priority
          sizes={
            compact
              ? "48px"
              : "(max-width: 640px) 48px, (max-width: 1024px) 56px, 64px"
          }
          className="
            rounded-full object-contain
            transition-transform duration-300
            group-hover:scale-105
          "
        />
      </div>

      {/* Institute Name */}
      <div className="flex min-w-0 flex-col">
        <span
          className={`
            whitespace-nowrap font-bold
            tracking-tight text-foreground
            transition-colors
            group-hover:text-brand-primary
            ${
              compact
                ? "text-base sm:text-lg"
                : "text-base sm:text-xl lg:text-2xl"
            }
          `}
        >
          LCC Institute
        </span>

        <span
          className={`
            whitespace-nowrap font-medium
            text-muted-foreground
            ${
              compact
                ? "text-[10px] sm:text-xs"
                : "text-[10px] sm:text-xs lg:text-sm"
            }
          `}
        >
          Learn Competition Classes
        </span>
      </div>
    </Link>
  );
}
