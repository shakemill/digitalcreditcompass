"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { UserCircle, Lock } from "lucide-react";

export default function ProfilePage() {
  const { user, loading } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
      return;
    }
    if (user) setName(user.name || "");
  }, [user, loading, router]);

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data?.error ?? "Update failed" });
        return;
      }
      setMessage({ type: "success", text: "Profile updated." });
      router.refresh();
    } catch {
      setMessage({ type: "error", text: "Request failed" });
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data?.error ?? "Password update failed" });
        return;
      }
      setMessage({ type: "success", text: "Password updated." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      router.refresh();
    } catch {
      setMessage({ type: "error", text: "Request failed" });
    } finally {
      setSaving(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-text-secondary">Loading…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div>
        <h2 className="font-heading text-2xl font-semibold text-text-primary">Mon profil</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Update your name and password.
        </p>
      </div>

      {message && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
          role="alert"
        >
          {message.text}
        </div>
      )}

      <div className="rounded-xl border border-border bg-surface-card p-6 shadow-sm">
        <h3 className="flex items-center gap-2 font-heading text-lg font-semibold text-text-primary">
          <UserCircle className="h-5 w-5 text-[var(--primary)]" />
          Informations personnelles
        </h3>
        <form onSubmit={handleUpdateProfile} className="mt-4 space-y-4">
          <div>
            <label htmlFor="profile-email" className="mb-1 block text-xs font-medium text-text-secondary">
              Email
            </label>
            <input
              id="profile-email"
              type="email"
              value={user.email}
              readOnly
              className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text-muted"
            />
            <p className="mt-1 text-xs text-text-muted">Email cannot be changed.</p>
          </div>
          <div>
            <label htmlFor="profile-name" className="mb-1 block text-xs font-medium text-text-secondary">
              Name
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-card px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Your name"
              required
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save profile"}
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-border bg-surface-card p-6 shadow-sm">
        <h3 className="flex items-center gap-2 font-heading text-lg font-semibold text-text-primary">
          <Lock className="h-5 w-5 text-text-muted" />
          Change password
        </h3>
        <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
          <div>
            <label htmlFor="profile-current-password" className="mb-1 block text-xs font-medium text-text-secondary">
              Current password
            </label>
            <input
              id="profile-current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-card px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <div>
            <label htmlFor="profile-new-password" className="mb-1 block text-xs font-medium text-text-secondary">
              New password
            </label>
            <input
              id="profile-new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-card px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="At least 8 characters"
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label htmlFor="profile-confirm-password" className="mb-1 block text-xs font-medium text-text-secondary">
              Confirm new password
            </label>
            <input
              id="profile-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-card px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg border border-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary)] hover:bg-[var(--primary-dim)] disabled:opacity-50"
          >
            {saving ? "Updating…" : "Update password"}
          </button>
        </form>
      </div>

      <p className="text-sm text-text-muted">
        <Link href="/dashboard" className="font-medium text-[var(--primary)] hover:underline">
          ← Back to dashboard
        </Link>
      </p>
    </div>
  );
}
