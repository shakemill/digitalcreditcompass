"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PlatformShell } from "@/components/layout/PlatformShell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sessionOk, setSessionOk] = useState<boolean | null>(null);
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    const check = async () => {
      const [adminRes, authRes] = await Promise.all([
        fetch("/api/admin/session"),
        fetch("/api/auth/session"),
      ]);
      const adminData = await adminRes.json();
      const authData = await authRes.json();
      const isSuperAdmin = authData?.user?.role === "SUPER_ADMIN";
      const hasAccess = !!adminData?.ok || isSuperAdmin;
      setSessionOk(hasAccess);
      if (!hasAccess && !isLoginPage) {
        router.replace("/admin/login");
      } else if (hasAccess && isLoginPage) {
        router.replace("/admin");
      }
    };
    check().catch(() => setSessionOk(false));
  }, [isLoginPage, router]);

  if (sessionOk === null && !isLoginPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-base">
        <p className="text-text-secondary">Checking access…</p>
      </div>
    );
  }

  return <PlatformShell>{children}</PlatformShell>;
}
