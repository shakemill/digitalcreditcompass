import { PlannerProvider } from "@/context/PlannerContext";
import { PlatformShell } from "@/components/layout/PlatformShell";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PlannerProvider>
      <PlatformShell>{children}</PlatformShell>
    </PlannerProvider>
  );
}
