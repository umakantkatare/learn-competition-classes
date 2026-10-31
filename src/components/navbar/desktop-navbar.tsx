"use client";

import Logo from "../common/logo";
import NavbarLinks from "./navbar-links";
import NavbarSearch from "./navbar-search";
import NavbarActions from "./navbar-actions";
import NavbarNotifications from "./navbar-notifications";
import NavbarUserMenu from "./navbar-userMenu";

import { authClient } from "@/lib/auth-client";
import { DEFAULT_USER_ROLE } from "@/lib/permissions";

export default function DesktopNavbar() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  return (
    <header className="hidden w-full items-center justify-between rounded-xl border bg-white px-6 py-4 shadow-sm lg:flex lg:px-8 xl:px-10">
      <Logo width={80} height={80} />

      <NavbarLinks />

      <div className="flex shrink-0 items-center gap-4">
        <NavbarSearch />

        {user ? (
          <>
            <div className="h-10 w-px bg-gray-200" aria-hidden="true" />

            <NavbarNotifications unreadCount={0} />

            <div className="h-10 w-px bg-gray-200" aria-hidden="true" />

            <NavbarUserMenu
              name={user.name}
              role={user.role!}
              avatar={user.image}
            />
          </>
        ) : (
          <NavbarActions />
        )}
      </div>
    </header>
  );
}
