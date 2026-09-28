import Image from "next/image";
import Link from "next/link";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { socialLinks } from "@/data/footer.data";

export function FooterBrand() {
  return (
    <div className="flex flex-col items-start gap-5">
      {/* Logo and Institute Name */}
      <Link href="/" className="flex items-center gap-3">
        <Image
          src="/images/LCC-logo.jpg"
          alt="LCC Institute Logo"
          width={64}
          height={64}
          className="h-16 w-16 object-contain"
        />

        <div className="flex flex-col">
          <span className="text-xl font-bold tracking-wide text-[#D4AF37]">
            LCC Institute
          </span>

          <span className="text-xs font-medium tracking-widest text-white/70">
            LEARN COMPETITION CLASSES
          </span>
        </div>
      </Link>

      {/* Description */}
      <p className="max-w-sm text-sm leading-7 text-white/65">
        Your trusted partner for government exam preparation. Get expert
        guidance, quality study material, live classes, and practice tests to
        achieve your career goals.
      </p>

      {/* Social Media Links */}
      <div className="flex flex-wrap items-center gap-3">
        {socialLinks.map(({ name, href, icon: Icon }) => (
          <Link
            href={href}
            target="_blank"
            key={name}
            rel="noopener noreferrer"
          >
            <HoverBorderGradient
              key={name}
              as="button"
              aria-label={name}
              containerClassName="rounded-full"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#111111] p-0 text-[#D4AF37]"
            >
              <Icon className="h-4 w-4" />
            </HoverBorderGradient>
          </Link>
        ))}
      </div>
    </div>
  );
}
