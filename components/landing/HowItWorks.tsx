import { Target, LineChart, BarChart3, FileSearch } from "lucide-react";

const STEPS = [
  {
    title: "Define Objective",
    description: "Specify capital, time horizon, and acceptable risk parameters.",
    Icon: Target,
  },
  {
    title: "Stress Test",
    description: "Simulate strategy performance across multiple market conditions.",
    Icon: LineChart,
  },
  {
    title: "Compare",
    description: "Evaluate providers and allocations using standardized safety scores and yield metrics.",
    Icon: BarChart3,
  },
  {
    title: "Generate Risk Analysis Report",
    description: "Export a risk analysis report documenting assumptions, scores, and scenario results.",
    Icon: FileSearch,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="font-heading text-[45px] font-bold leading-tight text-text-primary">
            How Digital Credit Compass <span className="text-[var(--primary)]">Works</span>
          </h2>
          <p className="mt-2 text-text-secondary">
            A structured framework for evaluating digital yield strategies.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ title, description, Icon }, i) => (
            <div
              key={title}
              className="rounded-xl border border-border bg-surface-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                <Icon className="h-7 w-7" />
              </div>
              <p className="mt-4 font-heading text-lg font-semibold text-text-primary">
                {i + 1}. {title}
              </p>
              <p className="mt-2 text-sm text-text-secondary">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
