export type RiskBand = "LOW" | "MEDIUM" | "ELEVATED" | "HIGH";

const config: Record<
  RiskBand,
  { bg: string; text: string; border: string; dot: string }
> = {
  LOW: {
    bg: "rgba(5, 150, 105, 0.12)",
    text: "#059669",
    border: "#059669",
    dot: "#059669",
  },
  MEDIUM: {
    bg: "rgba(217, 119, 6, 0.12)",
    text: "#D97706",
    border: "transparent",
    dot: "#D97706",
  },
  ELEVATED: {
    bg: "rgba(234, 88, 12, 0.12)",
    text: "#EA580C",
    border: "transparent",
    dot: "#EA580C",
  },
  HIGH: {
    bg: "rgba(220, 38, 38, 0.12)",
    text: "#DC2626",
    border: "transparent",
    dot: "#DC2626",
  },
};

const labels: Record<RiskBand, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  ELEVATED: "Elevated",
  HIGH: "High",
};

export function RiskBadge({ band }: { band: RiskBand }) {
  const c = config[band];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-xs font-medium"
      style={{
        backgroundColor: c.bg,
        color: c.text,
        borderColor: c.border,
        borderWidth: c.border === "transparent" ? 0 : 1,
      }}
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: c.dot }}
        aria-hidden
      />
      {labels[band]}
    </span>
  );
}
