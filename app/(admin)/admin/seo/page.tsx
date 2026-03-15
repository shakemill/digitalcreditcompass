"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";

type SEOSettings = {
  title: string;
  description: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
};

const defaultSettings: SEOSettings = {
  title: "",
  description: "",
  keywords: [],
  ogTitle: "",
  ogDescription: "",
};

export default function AdminSEOPage() {
  const [settings, setSettings] = useState<SEOSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/seo")
      .then((r) => r.json())
      .then((data) => {
        if (data.title != null) {
          setSettings({
            title: data.title ?? "",
            description: data.description ?? "",
            keywords: Array.isArray(data.keywords) ? data.keywords : [],
            ogTitle: data.ogTitle ?? "",
            ogDescription: data.ogDescription ?? "",
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    fetch("/api/admin/seo", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: settings.title || undefined,
        description: settings.description || undefined,
        keywords: settings.keywords.length ? settings.keywords : undefined,
        ogTitle: settings.ogTitle || undefined,
        ogDescription: settings.ogDescription || undefined,
      }),
    })
      .then((r) => {
        if (r.ok) setMessage({ type: "success", text: "SEO settings saved." });
        else return r.json().then((d) => { throw new Error(d?.error ?? "Failed to save"); });
      })
      .catch((err) => setMessage({ type: "error", text: err?.message ?? "Failed to save" }))
      .finally(() => setSaving(false));
  }

  const keywordsStr = settings.keywords.join("\n");
  const setKeywordsFromStr = (s: string) =>
    setSettings((prev) => ({
      ...prev,
      keywords: s
        .split(/[\n,]+/)
        .map((k) => k.trim())
        .filter(Boolean),
    }));

  if (loading) {
    return <p className="text-text-secondary">Loading…</p>;
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-text-primary">Landing page SEO</h1>
      <p className="mt-1 text-text-secondary">
        Edit the landing page title, meta description, and keywords (English). These values are used for search engines and social sharing.
      </p>

      {message && (
        <p
          className={`mt-6 max-w-2xl rounded-lg px-3 py-2 text-sm ${
            message.type === "success" ? "bg-risk-low-bg text-risk-low" : "bg-risk-high-bg text-risk-high"
          }`}
          role="alert"
        >
          {message.text}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-6">
        <div className="rounded-xl border border-border bg-surface-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-text-primary">Search & meta</h2>
          <p className="mt-1 text-sm text-text-muted">Title, description and keywords for search engines.</p>
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="seo-title" className="block text-sm font-medium text-text-primary">
                Page title
              </label>
              <input
                id="seo-title"
                type="text"
                maxLength={200}
                value={settings.title}
                onChange={(e) => setSettings((s) => ({ ...s, title: e.target.value }))}
                className="mt-1.5 w-full rounded-lg border border-border bg-surface-base px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. Digital Credit Compass | Clarity Before Yield"
              />
              <p className="mt-1 text-xs text-text-muted">Max 200 characters.</p>
            </div>
            <div>
              <label htmlFor="seo-description" className="block text-sm font-medium text-text-primary">
                Meta description
              </label>
              <textarea
                id="seo-description"
                rows={3}
                maxLength={500}
                value={settings.description}
                onChange={(e) => setSettings((s) => ({ ...s, description: e.target.value }))}
                className="mt-1.5 w-full rounded-lg border border-border bg-surface-base px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Short description for search results."
              />
              <p className="mt-1 text-xs text-text-muted">Max 500 characters.</p>
            </div>
            <div>
              <label htmlFor="seo-keywords" className="block text-sm font-medium text-text-primary">
                Keywords
              </label>
              <textarea
                id="seo-keywords"
                rows={4}
                value={keywordsStr}
                onChange={(e) => setKeywordsFromStr(e.target.value)}
                className="mt-1.5 w-full resize-y rounded-lg border border-border bg-surface-base px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Bitcoin yield, stablecoin income, risk analysis (comma-separated)"
              />
              <p className="mt-1 text-xs text-text-muted">One keyword or phrase per line, or comma-separated.</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-text-primary">Open Graph</h2>
          <p className="mt-1 text-sm text-text-muted">Title and description for social sharing (Facebook, Twitter, etc.).</p>
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="seo-og-title" className="block text-sm font-medium text-text-primary">
                Open Graph title
              </label>
              <input
                id="seo-og-title"
                type="text"
                maxLength={200}
                value={settings.ogTitle}
                onChange={(e) => setSettings((s) => ({ ...s, ogTitle: e.target.value }))}
                className="mt-1.5 w-full rounded-lg border border-border bg-surface-base px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Title for social sharing"
              />
            </div>
            <div>
              <label htmlFor="seo-og-description" className="block text-sm font-medium text-text-primary">
                Open Graph description
              </label>
              <textarea
                id="seo-og-description"
                rows={2}
                maxLength={500}
                value={settings.ogDescription}
                onChange={(e) => setSettings((s) => ({ ...s, ogDescription: e.target.value }))}
                className="mt-1.5 w-full rounded-lg border border-border bg-surface-base px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Description for social sharing"
              />
              <p className="mt-1 text-xs text-text-muted">Max 500 characters.</p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-text-primary px-4 py-2.5 text-sm font-medium text-surface-card hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save SEO settings"}
        </button>
      </form>
    </div>
  );
}
