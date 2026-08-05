"use client";

import { Header } from "@/components/Header";
import { RegisterAlert } from "@/components/RegisterAlert";
import { useSession } from "@/lib/auth/auth-client";

export default function HeaderWrapper() {
  const {
    data: session,
    isPending,
    error: sessionError,
    refetch,
  } = useSession();

  if (!session) {
    return <Header />;
  }

  const isAdminUser = session.session.role === "ADMIN";
  const isVolunteerUser = session.session.role === "VOLUNTEER";

  // 5. Show alert if they’re logged in but not registered
  return (
    <>
      {!(session.session.isRegistered || isAdminUser || isVolunteerUser) && (
        <RegisterAlert />
      )}
      <Header />
    </>
  );
}
