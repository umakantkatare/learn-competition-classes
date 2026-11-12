import DesktopNavbar from "./desktop-navbar";
import MobileNavbar from "./mobile-navbar";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="hidden md:block">
        <DesktopNavbar />
      </div>

      {/* Mobile Navbar */}
      <div className="block md:hidden">
        <MobileNavbar />
      </div>
    </header>
  );
}
