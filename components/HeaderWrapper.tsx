"use client";

import { useSession } from "@/lib/auth/auth-client";
import Header from "./Header";
import RegisterAlert from "./RegisterAlert";

export default function HeaderWrapper() {
  const {
    data: session,
    isPending,
    error: sessionError,
    refetch,
  } = useSession();

  if (!session) {
    // 2. If user is NOT logged in, no alert, just the basic Header
    return <Header isAdmin={false} isVolunteer={false} />;
  }

  // 4. Determine if they’re an admin & if they’re registered
  const isAdminUser = session.session.role === "ADMIN";
  const isVolunteerUser = session.session.role === "VOLUNTEER";

  // 5. Show alert if they’re logged in but not registered
  return (
    <>
      {!(session.session.isRegistered || isAdminUser || isVolunteerUser) && (
        <RegisterAlert />
      )}
      <Header isAdmin={isAdminUser} isVolunteer={isVolunteerUser} />
    </>
  );
}
