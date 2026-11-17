import { requireRole } from "@/lib/authorize";
import { ROLES } from "@/lib/permissions";

import Profile from "@/components/dashboard/profile/profile";

export default async function ManagerDashboardPage() {
  const user = await requireRole({
    roles: [ROLES.MANAGER],
  });

  return (
    <main className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Manager Dashboard</h1>

        <p className="text-muted-foreground">Welcome, {user.name}</p>
      </div>

      <Profile
        userName={user.name}
        userEmail={user.email}
        phoneNumber={user.phoneNumber ?? ""}
        userImage={user.image ?? ""}
        role={user.role}
        emailVerified={user.emailVerified}
        createdAt={user.createdAt}
      />
    </main>
  );
}
