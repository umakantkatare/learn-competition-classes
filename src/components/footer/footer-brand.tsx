import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { socialLinks } from "@/data/footer.data";
import Logo from "../common/logo";
import Link from "next/link";

export function FooterBrand() {
  return (
    <div className="flex flex-col items-start gap-5">
      {/* Logo and Institute Name */}
      <Logo compact href="/" className="[&_span]:text-white" />

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
            key={name}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit our ${name} page`}
          >
            <HoverBorderGradient
              as="button"
              containerClassName="rounded-full"
              className="
                flex size-10 items-center justify-center
                rounded-full bg-[#111111] p-0 text-[#D4AF37]
              "
            >
              <Icon className="size-4" aria-hidden="true" />
            </HoverBorderGradient>
          </Link>
        ))}
      </div>
    </div>
  );
}
