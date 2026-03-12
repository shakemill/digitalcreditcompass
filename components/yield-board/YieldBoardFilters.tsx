"use client";

export function YieldBoardFilters({ type }: { type: string }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-text-secondary">
      <span>Filters for {type}</span>
      {/* Placeholder: add risk band, score range, etc. */}
    </div>
  );
}
