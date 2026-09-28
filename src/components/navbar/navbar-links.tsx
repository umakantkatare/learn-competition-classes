"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import NavbarDropdown from "./navbar-dropdowm";

const navLinks = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Courses",
    href: "/courses",
    dropdown: true,
  },
  {
    label: "Live Classes",
    href: "/live-classes",
  },
  {
    label: "Test Series",
    href: "/test-series",
    dropdown: true,
  },
  {
    label: "About",
    href: "/about",
  },
  {
    label: "Contact",
    href: "/contact",
  },
];

export default function NavbarLinks() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className="flex h-full items-center gap-6 lg:gap-8 xl:gap-10"
    >
      {navLinks.map((item) => {
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <div
            key={item.href}
            className="group relative flex h-full items-center"
          >
            <Link
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex h-full items-center gap-1.5
                whitespace-nowrap text-base font-medium
                transition-colors duration-200 lg:text-lg
                ${
                  isActive
                    ? "text-[#EFA400]"
                    : "text-[#171717] hover:text-[#EFA400]"
                }`}
            >
              {item.label}

              {item.dropdown && (
                <ChevronDown
                  size={16}
                  strokeWidth={1.8}
                  className="transition-transform duration-200 group-hover:rotate-180"
                />
              )}

              {/* Active underline */}
              {isActive && (
                <span className="absolute -bottom-0.5 left-0 h-1 w-full rounded-t-full bg-[#F5A800]" />
              )}
            </Link>

            {/* Dropdown component will be added next */}
            {item.dropdown && (
              <NavbarDropdown
                type={item.href === "/courses" ? "courses" : "test-series"}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
