"use client"
import NavbarLogo from "./navbar-logo";
import NavbarLinks from "./navbar-links";
import NavbarSearch from "./navbar-search";
import NavbarActions from "./navbar-actions";
import NavbarNotifications from "./navbar-notifications";
import NavbarUserMenu from "./navbar-userMenu";
import { authClient } from "@/lib/auth-client";

export default function DesktopNavbar() {
  const { data: session, isPending } = authClient.useSession();

  const isLoggedIn = !!session?.user;

  const user = session?.user;

  return (
    <div className="flex h-[120px] items-center justify-between rounded-xl border bg-white px-6 shadow-sm lg:px-10">
      <NavbarLogo />

      <NavbarLinks />

      <div className="flex shrink-0 items-center gap-4">
        <NavbarSearch />

        {!isPending && (
          <>
            {isLoggedIn && user ? (
              <>
                <div className="h-12 w-px bg-gray-200" />

                <NavbarNotifications unreadCount={1} />

                <div className="h-12 w-px bg-gray-200" />

                <NavbarUserMenu
                  name={user.name || "Student"}
                  role="Student"
                  avatar={user.image || "/images/default-avatar.png"}
                />
              </>
            ) : (
              <NavbarActions />
            )}
          </>
        )}
      </div>
    </div>
  );
}
