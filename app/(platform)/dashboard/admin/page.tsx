"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardAdminPage() {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (!data?.user || data.user.role !== "SUPER_ADMIN") {
          router.replace("/dashboard");
          return;
        }
        router.replace("/admin");
      })
      .catch(() => router.replace("/dashboard"));
  }, [router]);

  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <p className="text-text-secondary">Redirecting to Admin…</p>
    </div>
  );
}
