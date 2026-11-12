"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

import NavbarDropdown from "./navbar-dropdowm";

const navLinks = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Courses",
    href: "/batches",
    dropdown: true,
  },
  {
    label: "Live Classes",
    href: "/live-classes",
  },
  {
    label: "About",
    href: "/about",
  },
  {
    label: "Contact",
    href: "/contact",
  },
] as const;

export default function NavbarLinks() {
  const pathname = usePathname();

  const isActiveRoute = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav aria-label="Main navigation">
      <NavigationMenu className="max-w-none">
        <NavigationMenuList className="gap-6 lg:gap-8 xl:gap-10">
          {navLinks.map((item) => {
            const isActive = isActiveRoute(item.href);

            const linkClassName = `
              relative flex h-10 items-center
              whitespace-nowrap rounded-none
              bg-transparent px-0 py-0
              text-base font-medium
              transition-colors duration-200
              lg:text-lg
              ${
                isActive
                  ? "text-[#EFA400]"
                  : "text-[#171717] hover:text-[#EFA400]"
              }
            `;

            const activeIndicator = isActive ? (
              <span
                aria-hidden="true"
                className="
                  absolute -bottom-0.5 left-0
                  h-1 w-full rounded-t-full
                  bg-[#F5A800]
                "
              />
            ) : null;

            return (
              <NavigationMenuItem key={item.href}>
                {"dropdown" in item && item.dropdown ? (
                  <>
                    <NavigationMenuTrigger
                      className={`
                        ${linkClassName}
                        shadow-none
                        hover:bg-transparent
                        focus:bg-transparent
                        data-[state=open]:bg-transparent
                        data-[state=open]:text-[#EFA400]
                        [&_svg]:transition-transform
                      `}
                    >
                      {item.label}
                      {activeIndicator}
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
                    className={linkClassName}
                  >
                    {item.label}
                    {activeIndicator}
                  </NavigationMenuLink>
                )}
              </NavigationMenuItem>
            );
          })}
        </NavigationMenuList>
      </NavigationMenu>
    </nav>
  );
}
