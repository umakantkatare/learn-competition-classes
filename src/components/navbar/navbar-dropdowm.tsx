
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  NavigationMenuContent,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

import { useGetExamCategories } from "@/hooks/academic/use-exam-categories";

interface NavbarDropdownProps {
  type: "courses" | "test-series";
}

const dropdownConfig = {
  courses: {
    basePath: "/batches",
    categoryPath: "/batches/category",
    allTitle: "All Courses",
    suffix: "Courses",
  },
  "test-series": {
    basePath: "/test-series",
    categoryPath: "/test-series/category",
    allTitle: "All Test Series",
    suffix: "Test Series",
  },
} as const;

export default function NavbarDropdown({
  type,
}: NavbarDropdownProps) {
  const pathname = usePathname();

  const {
    data: categories = [],
    isLoading,
    isError,
  } = useGetExamCategories(true);

  const config = dropdownConfig[type];

  const isActiveRoute = (href: string) => {
    if (href === config.basePath) {
      return pathname === href;
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  const navigationItems = [
    {
      title: config.allTitle,
      href: config.basePath,
    },
    ...categories.map((category) => ({
      title: `${category.name} ${config.suffix}`,
      href: `${config.categoryPath}/${category.slug}`,
    })),
  ];

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
      <div className="flex flex-col gap-1">
        {/* Navigation Items */}
        {navigationItems.map((item) => {
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
              className={getLinkClassName(isActive)}
            >
              {item.title}
            </NavigationMenuLink>
          );
        })}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-2 px-3 py-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-9 animate-pulse rounded-lg bg-muted"
              />
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <p className="px-3 py-3 text-sm text-destructive">
            Failed to load categories.
          </p>
        )}

        {/* Empty State */}
        {!isLoading && !isError && categories.length === 0 && (
          <p className="px-3 py-3 text-sm text-muted-foreground">
            No categories available.
          </p>
        )}
      </div>
    </NavigationMenuContent>
  );
}

function getLinkClassName(isActive: boolean) {
  return `
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
  `;
}
