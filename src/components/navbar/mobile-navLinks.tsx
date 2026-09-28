"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

interface MobileNavLinksProps {
  onNavigate: () => void;
}

const navItems = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses", dropdown: true },
  { label: "Live Classes", href: "/live-classes" },
  {
    label: "Test Series",
    href: "/test-series",
    dropdown: true,
  },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const dropdownItems: Record<string, { label: string; href: string }[]> = {
  "/courses": [
    { label: "All Courses", href: "/courses" },
    { label: "SSC", href: "/courses/ssc" },
    { label: "Banking", href: "/courses/banking" },
    { label: "Railway", href: "/courses/railway" },
    { label: "MP Police", href: "/courses/mp-police" },
  ],

  "/test-series": [
    { label: "All Test Series", href: "/test-series" },
    { label: "SSC", href: "/test-series/ssc" },
    { label: "Banking", href: "/test-series/banking" },
    { label: "Railway", href: "/test-series/railway" },
    { label: "MP Police", href: "/test-series/mp-police" },
  ],
};

export default function MobileNavLinks({ onNavigate }: MobileNavLinksProps) {
  const pathname = usePathname();

  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const toggleMenu = (href: string) => {
    setExpandedMenu((prev) => (prev === href ? null : href));
  };

  return (
    <nav aria-label="Mobile navigation links" className="flex flex-col gap-1">
      {navItems.map((item) => {
        const active = isActive(item.href);
        const expanded = expandedMenu === item.href;

        return (
          <div key={item.href}>
            <div
              className={`flex items-center justify-between
                rounded-xl transition-colors
                ${
                  active
                    ? "bg-amber-50 text-[#B77900]"
                    : "text-gray-800 hover:bg-gray-50"
                }`}
            >
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className="flex-1 px-4 py-3.5
                  text-base font-medium"
              >
                {item.label}
              </Link>

              {item.dropdown && (
                <button
                  type="button"
                  onClick={() => toggleMenu(item.href)}
                  aria-label={`Toggle ${item.label} menu`}
                  aria-expanded={expanded}
                  className="mr-2 flex h-10 w-10
                    items-center justify-center
                    rounded-lg hover:bg-amber-100"
                >
                  <ChevronDown
                    size={20}
                    className={`transition-transform
                      duration-200
                      ${expanded ? "rotate-180" : ""}`}
                  />
                </button>
              )}
            </div>

            {/* Expandable submenu */}
            {item.dropdown && (
              <div
                className={`grid transition-[grid-template-rows]
                  duration-300
                  ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
              >
                <div className="overflow-hidden">
                  <div
                    className="ml-5 flex flex-col
                    border-l-2 border-amber-200 py-1"
                  >
                    {dropdownItems[item.href].map((subItem) => {
                      const subActive = pathname === subItem.href;

                      return (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          onClick={onNavigate}
                          className={`ml-4 rounded-lg
                              px-4 py-3 text-sm
                              transition-colors
                              ${
                                subActive
                                  ? "bg-amber-50 font-semibold text-[#B77900]"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-[#B77900]"
                              }`}
                        >
                          {subItem.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
