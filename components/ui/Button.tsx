import { ButtonHTMLAttributes, ReactNode } from "react";

const moduleColors: Record<string, string> = {
  primary: "#F29C22",
  fiat: "#4F46E5",
  stbl: "#0891B2",
  port: "#7C3AED",
};

export function Button({
  children,
  variant = "primary",
  colorOverride,
  fullWidth,
  type = "button",
  disabled,
  className = "",
  ...props
}: {
  children: ReactNode;
  variant?: "primary" | "secondary";
  colorOverride?: "primary" | "fiat" | "stbl" | "port";
  fullWidth?: boolean;
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  disabled?: boolean;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type">) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-4 py-2 font-mono text-xs font-medium uppercase tracking-wider transition-colors disabled:opacity-50 hover:transition-shadow";

  if (variant === "secondary") {
    return (
      <button
        type={type}
        disabled={disabled}
        className={`${base} border border-border bg-surface-card text-text-secondary hover:border-border-strong hover:text-text-primary ${fullWidth ? "w-full" : ""} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }

  const bg =
    colorOverride && moduleColors[colorOverride]
      ? moduleColors[colorOverride]
      : "#F29C22";

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${base} text-white shadow-sm hover:-translate-y-px hover:opacity-95 hover:shadow-md ${fullWidth ? "w-full" : ""} ${className}`}
      style={{ backgroundColor: bg }}
      {...props}
    >
      {children}
    </button>
  );
}
