"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileCheck, ChevronRight } from "lucide-react";

type Pack = {
  id: string;
  providerId: string;
  overallConfidence: number;
  publishBlocked: boolean;
  adminStatus: string;
  createdAt: string;
  provider?: { id: string; name: string; slug: string; plannerType: string };
};

export default function AdminEvidencePacksPage() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/evidence-packs?status=PENDING")
      .then((r) => r.json())
      .then((data) => {
        setPacks(Array.isArray(data) ? data : []);
      })
      .catch(() => setPacks([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-text-secondary">Loading evidence packs…</p>;
  }

  return (
    <div>
      <p className="mt-1 text-text-secondary">
        Packs with adminStatus = PENDING. Approve all fields to publish a score snapshot.
      </p>
      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-surface-card shadow-sm">
        {packs.length === 0 ? (
          <div className="p-8 text-center text-text-muted">
            <FileCheck className="mx-auto h-12 w-12 text-border" />
            <p className="mt-2">No pending evidence packs.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {packs.map((pack) => (
              <li key={pack.id}>
                <Link
                  href={"/admin/evidence-packs/" + pack.id}
                  className="flex items-center justify-between px-4 py-4 hover:bg-surface-hover"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-elevated text-text-secondary">
                      <FileCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">
                        {pack.provider?.name ?? "Unknown"} · {pack.provider?.plannerType ?? ""}
                      </p>
                      <p className="text-sm text-text-secondary">
                        Confidence: {(pack.overallConfidence * 100).toFixed(0)}% ·{" "}
                        {new Date(pack.createdAt).toLocaleDateString()} ·{" "}
                        {pack.publishBlocked ? "Blocked" : "Published"}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-text-muted" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="mt-6">
        <Link href="/admin" className="text-sm text-text-secondary underline hover:text-text-primary">Back to admin</Link>
      </p>
    </div>
  );
}
