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
      className="flex shrink-0 items-center gap-3"
    >
      {/* Institute Logo */}
      <Image
        src="/images/LCC-logo.webp"
        alt="LCC Institute Logo"
        width={compact ? 56 : 100}
        height={compact ? 56 : 100}
        priority
        className="h-14 w-14 object-contain sm:h-16 sm:w-16 lg:h-24 lg:w-24 rounded-full"
      />

      {/* Institute Name */}
      <div className="flex flex-col">
        <span className="whitespace-nowrap text-lg font-bold tracking-tight text-[#171717] sm:text-xl lg:text-3xl">
          LCC Institute
        </span>

        <span className="whitespace-nowrap text-xs font-medium text-gray-600 sm:text-sm lg:text-base">
          Learn Competition Classes
        </span>
      </div>
    </Link>
  );
}
