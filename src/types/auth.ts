import type { UserRole } from "@/lib/permissions";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string | null;
}
