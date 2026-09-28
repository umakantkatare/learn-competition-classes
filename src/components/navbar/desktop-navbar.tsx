import NavbarLogo from "./navbar-logo";
import NavbarLinks from "./navbar-links";
import NavbarSearch from "./navbar-search";
import NavbarActions from "./navbar-actions";

export default function DesktopNavbar() {
  return (
    <div className="flex h-[120px] items-center justify-between rounded-xl border bg-white px-6 shadow-sm lg:px-10">
      <NavbarLogo />

      <NavbarLinks />

      <div className="flex shrink-0 items-center gap-4">
        <NavbarSearch />
        <NavbarActions />
      </div>
    </div>
  );
}
