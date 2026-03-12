"use client";

import { useEffect, useState } from "react";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "FREE" | "PRO" | "SUPER_ADMIN";
};

export function useSession(): { user: SessionUser | null; loading: boolean } {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        setUser(data?.user ?? null);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}

export function canExportPdf(role: string | undefined): boolean {
  return role === "PRO" || role === "SUPER_ADMIN";
}
