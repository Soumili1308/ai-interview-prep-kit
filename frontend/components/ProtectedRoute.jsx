"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "../context/AuthContext";
import LoadingState from "./LoadingState";

export default function ProtectedRoute({
  children,
}) {
  const { user, loading } = useAuth();

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(
        `/login?next=${encodeURIComponent(pathname)}`
      );
    }
  }, [loading, user, router, pathname]);

  if (loading) {
    return <LoadingState message="Checking your session..." />;
  }

  if (!user) {
    return <LoadingState message="Redirecting to login..." />;
  }

  return children;
}