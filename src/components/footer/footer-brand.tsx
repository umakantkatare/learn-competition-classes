
import Link from "next/link";
import { socialLinks } from "@/data/footer.data";
import Logo from "../common/logo";

export function FooterBrand() {
  return (
    <div className="flex min-w-0 flex-col items-start gap-4 sm:gap-5">
      <Logo compact href="/" className="[&_span]:text-white" />

      <p className="max-w-md text-xs leading-6 text-white/60 sm:text-sm sm:leading-7">
        Your trusted partner for government exam preparation. Get expert
        guidance, quality study material, live classes, and practice tests
        to achieve your career goals.
      </p>

      <nav aria-label="Social media links">
        <ul className="flex flex-wrap items-center gap-2.5">
          {socialLinks.map(({ name, href, icon: Icon }) => (
            <li key={name}>
              <Link
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit our ${name} page`}
                className="
                  flex size-10 items-center justify-center
                  rounded-full border border-white/10
                  bg-white/5 text-brand-primary
                  transition-colors duration-200
                  hover:border-brand-primary/50
                  hover:bg-brand-primary hover:text-black
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-brand-primary
                  focus-visible:ring-offset-2
                  focus-visible:ring-offset-[#080808]
                "
              >
                <Icon className="size-4" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
