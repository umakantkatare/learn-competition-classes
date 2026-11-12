
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

import NavbarDropdown from "./navbar-dropdowm";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/batches", dropdown: true },
  { label: "Live Classes", href: "/live-classes" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

interface NavbarLinksProps {
  onNavigate?: () => void;
}

export default function NavbarLinks({
  onNavigate = () => {},
}: NavbarLinksProps) {
  const pathname = usePathname();
  const [coursesOpen, setCoursesOpen] = useState(false);

  const isActiveRoute = (href: string) => {
    if (href === "/") return pathname === "/";

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const linkClassName = (isActive: boolean) => `
    relative flex h-10 items-center
    whitespace-nowrap rounded-none
    !bg-transparent px-0 py-0
    text-sm font-medium
    transition-colors duration-200
    lg:text-base
    ${
      isActive
        ? "text-brand-primary"
        : "text-foreground/80 hover:text-brand-primary"
    }
    hover:!bg-transparent
    focus:!bg-transparent
    data-[active]:!bg-transparent
    data-[state=open]:!bg-transparent
    focus-visible:outline-none
    focus-visible:ring-2
    focus-visible:ring-ring
    focus-visible:ring-offset-4
  `;

  const mobileLinkClassName = (isActive: boolean) => `
    flex w-full items-center justify-between
    rounded-lg px-3 py-3
    text-sm font-medium
    transition-colors duration-200
    ${
      isActive
        ? "bg-brand-primary/10 text-brand-primary"
        : "text-foreground hover:bg-muted hover:text-brand-primary"
    }
  `;

  const activeIndicator = (
    <span
      aria-hidden="true"
      className="absolute -bottom-0.5 left-0 h-0.5 w-full rounded-full bg-brand-primary"
    />
  );

  return (
    <>
      {/* Desktop Navigation */}
      <nav aria-label="Main navigation" className="hidden md:block">
        <NavigationMenu className="max-w-none">
          <NavigationMenuList className="gap-5 lg:gap-7 xl:gap-9">
            {navLinks.map((item) => {
              const isActive = isActiveRoute(item.href);
              const className = linkClassName(isActive);

              return (
                <NavigationMenuItem key={item.href}>
                  {"dropdown" in item && item.dropdown ? (
                    <>
                      <NavigationMenuTrigger
                        className={`
                          ${className}
                          shadow-none
                          hover:!bg-transparent
                          focus:!bg-transparent
                          data-[state=open]:!bg-transparent
                          data-[state=open]:text-brand-primary
                          [&_svg]:size-3.5
                          [&_svg]:transition-transform
                          [&_svg]:duration-200
                          data-[state=open]:[&_svg]:rotate-180
                        `}
                      >
                        {item.label}
                        {isActive && activeIndicator}
                      </NavigationMenuTrigger>

                      <NavbarDropdown type="courses" />
                    </>
                  ) : (
                    <NavigationMenuLink
                      render={
                        <Link
                          href={item.href}
                          aria-current={isActive ? "page" : undefined}
                        />
                      }
                      active={isActive}
                      className={className}
                    >
                      {item.label}
                      {isActive && activeIndicator}
                    </NavigationMenuLink>
                  )}
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>
      </nav>

      {/* Mobile Navigation */}
      <nav aria-label="Mobile navigation" className="w-full md:hidden">
        <div className="flex flex-col gap-1">
          {navLinks.map((item) => {
            const isActive = isActiveRoute(item.href);

            return (
              <div key={item.href}>
                {"dropdown" in item && item.dropdown ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setCoursesOpen((prev) => !prev)}
                      aria-expanded={coursesOpen}
                      className={mobileLinkClassName(isActive)}
                    >
                      <span>Courses</span>

                      <ChevronDown
                        className={`size-4 transition-transform duration-200 ${
                          coursesOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {coursesOpen && (
                      <div className="ml-3 mt-1 border-l border-border pl-3">
                        {[
                          { label: "All Courses", href: "/batches" },
                          { label: "SSC", href: "/courses/ssc" },
                          { label: "Banking", href: "/courses/banking" },
                          { label: "Railway", href: "/courses/railway" },
                          { label: "MP Police", href: "/courses/mp-police" },
                        ].map((course) => {
                          const active = isActiveRoute(course.href);

                          return (
                            <Link
                              key={course.href}
                              href={course.href}
                              onClick={onNavigate}
                              aria-current={active ? "page" : undefined}
                              className={`
                                block rounded-lg px-3 py-2.5
                                text-sm transition-colors
                                ${
                                  active
                                    ? "font-semibold text-brand-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-brand-primary"
                                }
                              `}
                            >
                              {course.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={isActive ? "page" : undefined}
                    className={mobileLinkClassName(isActive)}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </>
  );
}
