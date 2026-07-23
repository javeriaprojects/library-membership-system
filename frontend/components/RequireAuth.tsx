"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Role } from "@/lib/types";

interface RequireAuthProps {
  children: ReactNode;
  role?: Role;
}

export default function RequireAuth({ children, role }: RequireAuthProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
    } else if (role && user.role !== role) {
      router.replace("/");
    }
  }, [loading, user, role, router]);

  if (loading || !user || (role && user.role !== role)) {
    return <p style={{ padding: 32, color: "#5b6259" }}>Loading…</p>;
  }

  return <>{children}</>;
}
