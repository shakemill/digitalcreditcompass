"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { AccentStrip } from "@/components/layout/AccentStrip";

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

  return (
    <div className="flex min-h-screen flex-col bg-surface-base">
      <div className="hidden flex-1 overflow-hidden lg:flex">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-surface-base">
          <Topbar />
          <AccentStrip />
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <div className="flex min-h-full w-full min-w-0 flex-1 flex-col p-4 lg:p-6">
              {children}
            </div>
          </div>
        </main>
      </div>
      {/* Mobile: same as platform */}
      <div className="flex flex-1 flex-col items-center justify-center gap-5 p-8 lg:hidden">
        <p className="text-center text-text-secondary">
          Open on desktop for the best experience.
        </p>
      </div>
    </div>
  );
}
