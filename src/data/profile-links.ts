import {
  UserRound,
  BookOpen,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";

import type { UserRole } from "@/lib/permissions";

interface ProfileLink {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const profileLinks = {
  student: [
    {
      label: "My Profile",
      href: "/student",
      icon: UserRound,
    },
    {
      label: "My Courses",
      href: "/student/enrollments",
      icon: BookOpen,
    },
  ],

  teacher: [
    {
      label: "My Profile",
      href: "/teacher",
      icon: UserRound,
    },
    {
      label: "My Batches",
      href: "/teacher/batches",
      icon: GraduationCap,
    },
  ],

  manager: [
    {
      label: "My Profile",
      href: "/manager/profile",
      icon: UserRound,
    },
  ],

  admin: [
    {
      label: "My Profile",
      href: "/admin",
      icon: UserRound,
    },
  ],
} satisfies Record<UserRole, ProfileLink[]>;
