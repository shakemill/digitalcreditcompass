import Link from "next/link";
import { Package, FileCheck, Users, Search } from "lucide-react";
import { AdminSiteSettingsCard } from "@/components/admin/AdminSiteSettingsCard";

export default function AdminDashboardPage() {
  return (
    <div>
      <p className="mt-1 text-text-secondary">
        Manage providers and review evidence packs.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AdminSiteSettingsCard />
        <Link
          href="/admin/providers"
          className="flex items-center gap-4 rounded-xl border border-border bg-surface-card p-6 shadow-sm transition hover:border-border-strong hover:shadow"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-medium text-text-primary">Providers</h2>
            <p className="text-sm text-text-secondary">
              List, create, and edit providers and scoring inputs.
            </p>
          </div>
        </Link>
        <Link
          href="/admin/evidence-packs"
          className="flex items-center gap-4 rounded-xl border border-border bg-surface-card p-6 shadow-sm transition hover:border-border-strong hover:shadow"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary">
            <FileCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-medium text-text-primary">Evidence Packs</h2>
            <p className="text-sm text-text-secondary">
              Review and approve pending evidence packs.
            </p>
          </div>
        </Link>
        <Link
          href="/admin/users"
          className="flex items-center gap-4 rounded-xl border border-border bg-surface-card p-6 shadow-sm transition hover:border-border-strong hover:shadow"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-medium text-text-primary">Users</h2>
            <p className="text-sm text-text-secondary">
              Manage users, activate/deactivate accounts, change plan.
            </p>
          </div>
        </Link>
        <Link
          href="/admin/seo"
          className="flex items-center gap-4 rounded-xl border border-border bg-surface-card p-6 shadow-sm transition hover:border-border-strong hover:shadow"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary">
            <Search className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-medium text-text-primary">Landing SEO</h2>
            <p className="text-sm text-text-secondary">
              Edit landing page title, description and keywords (English).
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
