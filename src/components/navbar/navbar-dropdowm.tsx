
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  NavigationMenuContent,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

const courseItems = [
  { title: "All Courses", href: "/batches" },
  { title: "SSC Courses", href: "/courses/ssc" },
  { title: "Banking Courses", href: "/courses/banking" },
  { title: "Railway Courses", href: "/courses/railway" },
  { title: "MP Police Courses", href: "/courses/mp-police" },
] as const;

const testSeriesItems = [
  { title: "All Test Series", href: "/test-series" },
  { title: "SSC Test Series", href: "/test-series/ssc" },
  { title: "Banking Test Series", href: "/test-series/banking" },
  { title: "Railway Test Series", href: "/test-series/railway" },
  { title: "MP Police Test Series", href: "/test-series/mp-police" },
] as const;

interface NavbarDropdownProps {
  type: "courses" | "test-series";
}

export default function NavbarDropdown({
  type,
}: NavbarDropdownProps) {
  const pathname = usePathname();

  const items =
    type === "courses" ? courseItems : testSeriesItems;

  const isActiveRoute = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <NavigationMenuContent
      className="
        w-80 max-w-[calc(100vw-2rem)]
        overflow-hidden rounded-xl
        border border-border
        bg-popover p-2
        text-popover-foreground
        shadow-xl shadow-black/10
      "
    >

      {/* Navigation Items */}
      <div className="flex flex-col gap-1">
        {items.map((item) => {
          const isActive = isActiveRoute(item.href);

          return (
            <NavigationMenuLink
              key={item.href}
              render={
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                />
              }
              active={isActive}
              className={`
                flex w-full items-center
                rounded-lg px-3 py-3
                text-sm font-medium
                !bg-transparent
                outline-none
                transition-colors duration-200

                ${
                  isActive
                    ? "text-brand-primary"
                    : "text-foreground/80 hover:text-brand-primary"
                }

                hover:!bg-transparent
                focus:!bg-transparent
                data-[active]:!bg-transparent

                focus-visible:ring-2
                focus-visible:ring-ring
                focus-visible:ring-offset-2
              `}
            >
              {item.title}
            </NavigationMenuLink>
          );
        })}
      </div>
    </NavigationMenuContent>
  );
}
