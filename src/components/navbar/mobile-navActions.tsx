
import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";

interface MobileNavActionsProps {
  onNavigate: () => void;
}

export default function MobileNavActions({
  onNavigate,
}: MobileNavActionsProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Login Button */}
      <Link
        href="/login"
        onClick={onNavigate}
        className="flex h-12 w-full items-center
          justify-center gap-2 rounded-full
          border-2 border-[#F5A800]
          text-sm font-semibold text-[#171717]
          transition-colors hover:bg-amber-50"
      >
        <LogIn size={18} />
        Login
      </Link>

      {/* Sign Up Button */}
      <Link
        href="/signup"
        onClick={onNavigate}
        className="flex h-12 w-full items-center
          justify-center gap-2 rounded-full
          bg-[#F5A800] text-sm font-semibold
          text-black shadow-sm transition-colors
          hover:bg-amber-500"
      >
        <UserPlus size={18} />
        Sign Up
      </Link>
    </div>
  );
}