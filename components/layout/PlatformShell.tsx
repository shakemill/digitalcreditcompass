"use client";

import { SidebarProvider, useSidebar } from "@/components/layout/SidebarProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { AccentStrip } from "@/components/layout/AccentStrip";
import { InactivityWatcher } from "@/components/layout/InactivityWatcher";

function PlatformShellInner({ children }: { children: React.ReactNode }) {
  const sidebar = useSidebar();
  const showOverlay = sidebar && !sidebar.isDesktop && sidebar.sidebarOpen;

  return (
    <div className="flex min-h-screen flex-col bg-surface-base">
      <div className="flex min-h-screen flex-1 overflow-hidden">
        <Sidebar />
        {showOverlay && (
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() => sidebar.setSidebarOpen(false)}
          />
        )}
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
      <InactivityWatcher />
    </div>
  );
}

export function PlatformShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <PlatformShellInner>{children}</PlatformShellInner>
    </SidebarProvider>
  );
}
