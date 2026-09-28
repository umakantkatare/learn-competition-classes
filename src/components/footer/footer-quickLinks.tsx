import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { quickLinks } from "@/data/footer.data";



export function FooterQuickLinks() {
  return (
    <div className="flex flex-col gap-5">
      {/* Heading */}
      <h3 className="text-base font-semibold text-white">
        Quick Links
      </h3>

      {/* Gold underline */}
      <div className="h-1 w-10 rounded-full bg-[#D4AF37]" />

      {/* Navigation Links */}
      <nav aria-label="Footer quick links">
        <ul className="flex flex-col gap-3">
          {quickLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="group flex w-fit items-center gap-2 text-sm text-white/65 transition-colors duration-200 hover:text-[#D4AF37]"
              >
                <span>{link.label}</span>

                <ArrowUpRight
                  className="h-3.5 w-3.5 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}