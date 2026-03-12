"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Pack = {
  id: string;
  providerId: string;
  proposedClassifications: Record<
    string,
    { proposedValue?: unknown; confidence?: number; sources?: unknown[]; adminStatus?: string }
  >;
  overallConfidence: number;
  publishBlocked: boolean;
  adminStatus: string;
  provider?: { id: string; name: string; slug: string; plannerType: string };
};

export default function EvidencePackDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [pack, setPack] = useState<Pack | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/evidence-packs/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setPack(null);
        else setPack(data);
      })
      .catch(() => setPack(null))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleApproveField(field: string) {
    try {
      const res = await fetch(`/api/evidence-packs/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, adminStatus: "APPROVED", approvedBy: "admin-ui" }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setPack((p) =>
        p
          ? {
              ...p,
              proposedClassifications: {
                ...p.proposedClassifications,
                [field]: {
                  ...p.proposedClassifications[field],
                  adminStatus: "approved",
                },
              },
            }
          : null
      );
    } catch {
      // ignore
    }
  }

  async function handlePublish() {
    setPublishing(true);
    setError("");
    try {
      const res = await fetch(`/api/evidence-packs/${id}/publish`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Publish failed");
        return;
      }
      setError("");
      setPack((p) => (p ? { ...p, publishBlocked: false, adminStatus: "APPROVED" } : null));
      alert(data?.message || "Published.");
    } catch {
      setError("Request failed");
    } finally {
      setPublishing(false);
    }
  }

  if (loading || !pack) {
    return (
      <div>
        {loading ? <p className="text-gray-600">Loading…</p> : <p className="text-gray-600">Pack not found.</p>}
        <Link href="/admin/evidence-packs" className="mt-4 inline-block text-sm text-gray-600 underline">Back to queue</Link>
      </div>
    );
  }

  const classifications = pack.proposedClassifications || {};
  const entries = Object.entries(classifications);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Evidence pack</h1>
      <p className="mt-1 text-gray-600">
        {pack.provider?.name} · {pack.provider?.plannerType} · Confidence: {(pack.overallConfidence * 100).toFixed(0)}%
      </p>
      <p className="mt-1 text-sm text-gray-500">
        {pack.publishBlocked ? "Publish blocked until all fields approved." : "Published."}
      </p>

      <section className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Proposed classifications</h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Field</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Value</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Confidence</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {entries.map(([field, obj]) => (
                <tr key={field}>
                  <td className="px-4 py-3 font-mono text-sm text-gray-900">{field}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {String(obj?.proposedValue ?? "—")}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {obj?.confidence != null ? `${(obj.confidence * 100).toFixed(0)}%` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {obj?.adminStatus === "approved" ? (
                      <span className="text-sm text-green-600">Approved</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleApproveField(field)}
                        className="text-sm text-gray-600 underline hover:text-gray-900"
                      >
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {pack.publishBlocked && (
        <div className="mt-6">
          <button
            type="button"
            onClick={handlePublish}
            disabled={publishing}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {publishing ? "Publishing…" : "Approve all & publish score snapshot"}
          </button>
          <p className="mt-2 text-sm text-gray-500">
            Creates ScoringInput + ScoreSnapshot and sets publishBlocked = false.
          </p>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <p className="mt-8">
        <Link href="/admin/evidence-packs" className="text-sm text-gray-600 underline">Back to queue</Link>
      </p>
    </div>
  );
}
