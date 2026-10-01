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
    <nav aria-label="Main navigation">
      <NavigationMenu className="max-w-none">
        <NavigationMenuList className="gap-6 lg:gap-8 xl:gap-10">
          {navLinks.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            const linkClassName = `relative flex h-full items-center
              whitespace-nowrap text-base font-medium transition-colors
              duration-200 lg:text-lg ${
                isActive
                  ? "text-[#EFA400]"
                  : "text-[#171717] hover:text-[#EFA400]"
              }`;

            return (
              <NavigationMenuItem key={item.href}>
                {item.dropdown ? (
                  <>
                    <NavigationMenuTrigger
                      className={`${linkClassName} rounded-none bg-transparent
                        px-0 py-0 hover:bg-transparent focus:bg-transparent
                        data-popup-open:bg-transparent data-open:bg-transparent`}
                    >
                      {item.label}
                      {isActive && (
                        <span className="absolute -bottom-0.5 left-0 h-1 w-full rounded-t-full bg-[#F5A800]" />
                      )}
                    </NavigationMenuTrigger>
                    <NavbarDropdown
                      type={item.href === "/courses" ? "courses" : "test-series"}
                    />
                  </>
                ) : (
                  <NavigationMenuLink
                    render={
                      <Link
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                      />
                    }
                    className={linkClassName}
                    active={isActive}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute -bottom-0.5 left-0 h-1 w-full rounded-t-full bg-[#F5A800]" />
                    )}
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
