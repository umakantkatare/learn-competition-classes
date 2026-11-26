
import Link from "next/link";

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "Refund Policy", href: "/refund-policy" },
];

export function FooterBottom() {
  return (
    <div
      className="
        flex flex-col items-center justify-between
        gap-4 text-center
        lg:flex-row lg:gap-6 lg:text-left
      "
    >
      <p className="text-xs leading-5 text-white/50">
        © {new Date().getFullYear()} LCC Institute. All rights reserved.
      </p>

      <nav
        aria-label="Legal information"
        className="
          flex flex-wrap items-center justify-center
          gap-x-4 gap-y-2 sm:gap-x-5
        "
      >
        {legalLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="
              text-xs text-white/50 transition-colors
              hover:text-brand-primary
              focus-visible:text-brand-primary
              focus-visible:outline-none
            "
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <p className="text-xs leading-5 text-white/50">
        Made with care for LCC students.
      </p>
    </div>
  );
}
