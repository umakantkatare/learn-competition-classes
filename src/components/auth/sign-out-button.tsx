"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

type SignOutButtonProps = {
  variant?: "button" | "menu";
};

export function SignOutButton({ variant = "button" }: SignOutButtonProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    if (isSigningOut) return;

    setIsSigningOut(true);

    try {
      const { error } = await authClient.signOut();

      if (error) {
        setIsSigningOut(false);
        return;
      }

      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Sign out failed:", error);
      setIsSigningOut(false);
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      disabled={isSigningOut}
      onClick={handleSignOut}
      className={
        variant === "menu"
          ? "h-8 w-full justify-start rounded-sm px-2 font-normal text-destructive hover:bg-destructive/10 hover:text-destructive"
          : "w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
      }
    >
      {isSigningOut ? (
        <Loader2 className="mr-2 size-4 animate-spin" />
      ) : (
        <LogOut className="mr-2 size-4" />
      )}

      {isSigningOut ? "Signing out..." : "Sign out"}
    </Button>
  );
}
