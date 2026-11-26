
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { quickLinks } from "@/data/footer.data";
import { FooterSection } from "./footer-section";

export function FooterQuickLinks() {
  return (
    <FooterSection title="Quick Links">
      <nav aria-label="Footer quick links">
        <ul className="flex flex-col gap-2">
          {quickLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="
                  group flex w-fit max-w-full items-center gap-1.5
                  py-1 text-xs leading-5 text-white/60
                  transition-colors duration-200
                  hover:text-brand-primary
                  sm:text-sm sm:leading-6
                  focus-visible:outline-none
                  focus-visible:text-brand-primary
                "
              >
                <span className="break-words">{link.label}</span>

                <ArrowUpRight
                  className="
                    size-3.5 shrink-0 opacity-0
                    transition-all duration-200
                    group-hover:translate-x-0.5
                    group-hover:-translate-y-0.5
                    group-hover:opacity-100
                  "
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </FooterSection>
  );
}
