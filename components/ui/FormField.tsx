import { ReactNode } from "react";

export function FormField({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-[8.5px] font-medium uppercase tracking-wider text-text-muted">
        {label}
        {required && <span className="text-risk-high"> *</span>}
      </label>
      {children}
      {error != null && (
        <p className="font-mono text-xs text-risk-high">{error}</p>
      )}
    </div>
  );
}
