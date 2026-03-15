"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { UserCheck, UserX, ChevronDown, Search, Users, RefreshCw, Check, Loader2 } from "lucide-react";

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  subscriptionPeriodEnd: string | null;
  plan: { slug: string; name: string } | null;
  subscriptionStatus: string | null;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [roleDropdownId, setRoleDropdownId] = useState<string | null>(null);
  const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const closeRoleDropdown = useCallback(() => {
    setRoleDropdownId(null);
    setDropdownRect(null);
  }, []);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        if (data?.users) setUsers(data.users);
        else setUsers([]);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const showMessage = useCallback((type: "success" | "error", text: string) => {
    setMessage({ type, text });
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, []);

  const filteredUsers = useMemo(() => {
    if (!searchInput.trim()) return users;
    const q = searchInput.trim().toLowerCase();
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        (u.name && u.name.toLowerCase().includes(q))
    );
  }, [users, searchInput]);

  const handleToggleActive = useCallback(
    async (u: UserRow) => {
      setUpdatingId(u.id);
      try {
        const res = await fetch(`/api/admin/users/${u.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !u.isActive }),
        });
        if (res.ok) {
          fetchUsers();
          showMessage("success", u.isActive ? "User deactivated." : "User activated.");
        } else {
          const d = await res.json().catch(() => ({}));
          showMessage("error", d?.error ?? "Failed to update");
        }
      } finally {
        setUpdatingId(null);
      }
    },
    [fetchUsers, showMessage]
  );

  const handleChangeRole = useCallback(
    async (userId: string, role: "FREE" | "PRO") => {
      closeRoleDropdown();
      setUpdatingId(userId);
      try {
        const res = await fetch(`/api/admin/users/${userId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role }),
        });
        if (res.ok) {
          fetchUsers();
          showMessage("success", `Plan set to ${role}.`);
        } else {
          const d = await res.json().catch(() => ({}));
          showMessage("error", d?.error ?? "Failed to update");
        }
      } finally {
        setUpdatingId(null);
      }
    },
    [fetchUsers, showMessage, closeRoleDropdown]
  );

  const openRoleDropdown = useCallback((e: React.MouseEvent<HTMLButtonElement>, userId: string) => {
    if (roleDropdownId === userId) {
      closeRoleDropdown();
      return;
    }
    setDropdownRect((e.currentTarget as HTMLElement).getBoundingClientRect());
    setRoleDropdownId(userId);
  }, [roleDropdownId, closeRoleDropdown]);

  const activeCount = users.filter((u) => u.isActive).length;

  return (
    <div className="min-w-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-text-primary">Users</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage users, activate or deactivate accounts, and change plan (FREE / PRO).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchUsers()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-card px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`mt-4 flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
            message.type === "success" ? "bg-risk-low-bg text-risk-low" : "bg-risk-high-bg text-risk-high"
          }`}
          role="alert"
        >
          {message.type === "success" ? <Check className="h-4 w-4 shrink-0" /> : null}
          {message.text}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              placeholder="Search by email or name…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-card py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Users className="h-4 w-4" />
            <span>
              {users.length} user{users.length !== 1 ? "s" : ""}
              {users.length > 0 && (
                <span className="text-text-secondary"> ({activeCount} active)</span>
              )}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-visible rounded-xl border border-border bg-surface-card shadow-sm">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr className="bg-surface-elevated">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                  Plan
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-muted">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface-card">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-sm text-text-muted">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-text-muted" />
                    <p className="mt-2">Loading users…</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-2 text-text-muted">
                      <Users className="h-12 w-12 opacity-50" />
                      <p className="text-sm font-medium text-text-secondary">
                        {searchInput.trim() ? "No users match your search." : "No users yet."}
                      </p>
                      {searchInput.trim() && (
                        <button
                          type="button"
                          onClick={() => setSearchInput("")}
                          className="text-sm text-primary hover:underline"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isUpdating = updatingId === u.id;
                  return (
                    <tr
                      key={u.id}
                      className="transition-colors hover:bg-surface-hover/50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-text-primary">{u.name || "—"}</span>
                          <span className="text-sm text-text-muted">{u.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            u.role === "PRO"
                              ? "bg-primary-100 text-primary-700"
                              : u.role === "SUPER_ADMIN"
                                ? "bg-surface-elevated text-text-muted"
                                : "bg-surface-elevated text-text-secondary"
                          }`}
                        >
                          {u.role === "SUPER_ADMIN" ? "Admin" : u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                              u.emailVerified ? "bg-risk-low-bg text-risk-low" : "bg-surface-elevated text-text-muted"
                            }`}
                          >
                            {u.emailVerified ? "Verified" : "Unverified"}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                              u.isActive ? "bg-risk-low-bg text-risk-low" : "bg-risk-high-bg text-text-muted"
                            }`}
                          >
                            {u.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(u)}
                            disabled={isUpdating}
                            title={u.isActive ? "Deactivate" : "Activate"}
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                              u.isActive
                                ? "border-risk-mid bg-risk-mid-bg text-risk-mid hover:bg-risk-mid-bg/80"
                                : "border-border bg-surface-elevated text-text-secondary hover:bg-surface-hover"
                            }`}
                          >
                            {isUpdating ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : u.isActive ? (
                              <UserX className="h-3.5 w-3.5" />
                            ) : (
                              <UserCheck className="h-3.5 w-3.5" />
                            )}
                            {u.isActive ? "Deactivate" : "Activate"}
                          </button>
                          {u.role !== "SUPER_ADMIN" && (
                            <div className="relative">
                              <button
                                type="button"
                                onClick={(e) => openRoleDropdown(e, u.id)}
                                disabled={isUpdating}
                                className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface-card px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-hover disabled:opacity-50"
                              >
                                Change plan
                                <ChevronDown className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filteredUsers.length > 0 && searchInput.trim() && (
          <p className="text-sm text-text-muted">
            Showing {filteredUsers.length} of {users.length} users
          </p>
        )}
      </div>

      {typeof document !== "undefined" &&
        roleDropdownId &&
        dropdownRect &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[100]"
              aria-hidden
              onClick={closeRoleDropdown}
            />
            <div
              className="fixed z-[101] w-40 rounded-lg border border-border bg-surface-card py-1 shadow-lg"
              style={{
                top: dropdownRect.bottom + 4,
                right: window.innerWidth - dropdownRect.right,
              }}
            >
              {(() => {
                const u = filteredUsers.find((x) => x.id === roleDropdownId);
                if (!u) return null;
                return (["FREE", "PRO"] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleChangeRole(u.id, role)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-text-primary hover:bg-surface-hover"
                  >
                    {role}
                    {u.role === role && <Check className="h-4 w-4 text-risk-low" />}
                  </button>
                ));
              })()}
            </div>
          </>,
          document.body
        )}
    </div>
  );
}
