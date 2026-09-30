import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";

export default function NavbarActions() {
  return (
    <div className="flex shrink-0 items-center gap-3">
      {/* Login Button */}
      <Link
        href="/sign-in"
        className="inline-flex h-12 items-center justify-center
          gap-2 whitespace-nowrap rounded-full
          border-2 border-[#F5A800] px-5
          text-sm font-semibold text-[#171717]
          transition-all duration-200
          hover:bg-amber-50 lg:px-6 lg:text-base"
      >
        {/* <LogIn size={18} strokeWidth={2} /> */}
        Login
      </Link>

      {/* Sign Up Button */}
      <Link
        href="/sign-up"
        className="inline-flex h-12 items-center justify-center
          gap-2 whitespace-nowrap rounded-full
          bg-[#F5A800] px-5
          text-sm font-semibold text-black
          shadow-sm transition-all duration-200
          hover:bg-amber-500 lg:px-6 lg:text-base"
      >
        {/* <UserPlus size={18} strokeWidth={2} /> */}
        Sign Up
      </Link>
    </div>
  );
}
