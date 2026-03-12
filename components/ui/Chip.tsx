import { ReactNode } from "react";

const variantStyles: Record<
  string,
  { bg: string; text: string }
> = {
  btc: { bg: "rgba(242, 156, 34, 0.15)", text: "#F29C22" },
  fiat: { bg: "rgba(79, 70, 229, 0.12)", text: "#4F46E5" },
  stbl: { bg: "rgba(8, 145, 178, 0.12)", text: "#0891B2" },
  port: { bg: "rgba(124, 58, 237, 0.12)", text: "#7C3AED" },
  green: { bg: "rgba(5, 150, 105, 0.12)", text: "#059669" },
  amber: { bg: "rgba(217, 119, 6, 0.12)", text: "#D97706" },
  red: { bg: "rgba(220, 38, 38, 0.12)", text: "#DC2626" },
  muted: { bg: "var(--color-surface-elevated)", text: "var(--color-text-muted)" },
};

export function Chip({
  children,
  variant = "muted",
}: {
  children: ReactNode;
  variant?: "btc" | "fiat" | "stbl" | "port" | "green" | "amber" | "red" | "muted";
}) {
  const style = variantStyles[variant] ?? variantStyles.muted;
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 font-mono text-xs font-medium"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {children}
    </span>
  );
}
