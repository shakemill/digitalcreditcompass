import { PlannerProvider } from "@/context/PlannerContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { AccentStrip } from "@/components/layout/AccentStrip";
import { Monitor } from "lucide-react";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PlannerProvider>
      <div className="flex min-h-screen flex-col bg-surface-base">
        {/* Desktop layout */}
        <div className="hidden flex-1 overflow-hidden lg:flex">
          <Sidebar />
          <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-surface-base">
            <Topbar />
            <AccentStrip />
            <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
              <div className="mx-auto flex min-h-full w-full max-w-[1600px] min-w-0 flex-1 flex-col overflow-x-hidden px-4 py-5 lg:px-8 lg:py-6">
                {children}
              </div>
            </div>
          </main>
        </div>
        {/* Mobile: require desktop */}
        <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-surface-base p-8 lg:hidden">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-surface-elevated shadow-sm">
            <Monitor className="h-10 w-10 text-text-muted" aria-hidden />
          </div>
          <div className="space-y-2 text-center">
            <p className="font-heading text-xl font-semibold text-text-primary">
              Desktop required
            </p>
            <p className="max-w-sm font-sans text-sm text-text-secondary">
              Open this app on a device with at least 1024px width for the best experience.
            </p>
          </div>
        </div>
      </div>
    </PlannerProvider>
  );
}
