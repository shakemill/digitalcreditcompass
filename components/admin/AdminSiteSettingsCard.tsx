"use client";

import { useState, useEffect } from "react";
import { Settings } from "lucide-react";

export function AdminSiteSettingsCard() {
  const [comingSoonEnabled, setComingSoonEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch("/api/site-settings")
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.comingSoonEnabled === "boolean") setComingSoonEnabled(data.comingSoonEnabled);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleToggle(checked: boolean) {
    setUpdating(true);
    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comingSoonEnabled: checked }),
      });
      if (res.ok) setComingSoonEnabled(checked);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-surface-card p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary">
          <Settings className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-medium text-text-primary">Site</h2>
          <p className="text-sm text-text-secondary">
            When enabled, the home page redirects to a &quot;Coming soon&quot; page for visitors. You (admin) still see the normal home.
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        {loading ? (
          <span className="text-sm text-text-muted">Loading…</span>
        ) : (
          <>
            <button
              type="button"
              role="switch"
              aria-checked={comingSoonEnabled}
              disabled={updating}
              onClick={() => handleToggle(!comingSoonEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 disabled:opacity-50 ${
                comingSoonEnabled ? "bg-[var(--primary)]" : "bg-surface-elevated"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
                  comingSoonEnabled ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-sm font-medium text-text-primary">
              Coming soon page {comingSoonEnabled ? "on" : "off"}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
