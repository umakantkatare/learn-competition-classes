import Link from "next/link";
import { ShieldCheck, LockKeyhole } from "lucide-react";

import { Separator } from "@/components/ui/separator";

const legalLinks = [
  {
    label: "Privacy Policy",
    href: "/privacy-policy",
  },
  {
    label: "Terms & Conditions",
    href: "/terms-and-conditions",
  },
  {
    label: "Refund Policy",
    href: "/refund-policy",
  },
];

export function FooterBottom() {
  return (
    <div className="flex flex-col gap-6">
      {/* Copyright and Legal Links */}
      <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
        <p className="text-xs leading-6 text-white/50">
          © {new Date().getFullYear()} LCC Institute. All rights reserved.
        </p>

        <nav
          aria-label="Legal navigation"
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
        >
          {legalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs text-white/50 transition-colors hover:text-[#D4AF37]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="text-xs text-white/50">
          Made with care for LCC students.
        </p>
      </div>
    </div>
  );
}
