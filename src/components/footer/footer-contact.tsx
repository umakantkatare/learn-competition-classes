import Link from "next/link";
import { Clock } from "lucide-react";

import { contactDetails } from "@/data/footer.data";
import { FooterSection } from "./footer-section";

export function FooterContact() {
  return (
    <FooterSection title="Get in Touch">
      <div className="flex min-w-0 flex-col gap-3">
        {contactDetails.map(({ label, value, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            target={label === "Address" ? "_blank" : undefined}
            rel={
              label === "Address" ? "noopener noreferrer" : undefined
            }
            aria-label={`${label}: ${value}`}
            className="
              group flex min-w-0 items-start gap-2.5
              rounded-sm py-1 text-xs leading-relaxed
              text-white/60 transition-colors
              hover:text-brand-primary
              sm:gap-3 sm:text-sm
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-brand-primary
            "
          >
            <Icon
              className="mt-0.5 size-4 shrink-0 text-brand-primary"
              aria-hidden="true"
            />

            <span className="min-w-0 break-words [overflow-wrap:anywhere]">
              {value}
            </span>
          </Link>
        ))}

        <div className="flex items-start gap-2.5 py-1 text-xs leading-relaxed text-white/60 sm:gap-3 sm:text-sm">
          <Clock className="mt-0.5 size-4 shrink-0 text-brand-primary" />

          <div className="flex min-w-0 flex-col gap-1">
            <span className="font-medium text-white/80">
              Working Hours
            </span>
            <span>Mon – Sat: 9:00 AM – 6:00 PM</span>
          </div>
        </div>
      </div>
    </FooterSection>
  );
}