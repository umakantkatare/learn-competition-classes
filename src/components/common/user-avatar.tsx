"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type UserAvatarProps = {
  name: string;
  image?: string | null;
  className?: string;
};

export function UserAvatar({
  name,
  image,
  className = "size-9",
}: UserAvatarProps) {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <Avatar className={className}>
      <AvatarImage src={image ?? undefined} alt={name} />
      <AvatarFallback className="bg-accent text-sm font-semibold text-text-primary">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
