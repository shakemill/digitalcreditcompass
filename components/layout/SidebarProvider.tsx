"use client";

import { createContext, useContext, useEffect, useState } from "react";

const LG = 1024;

type SidebarContextValue = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isDesktop: boolean;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) return null;
  return ctx;
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${LG}px)`);
    function update() {
      const desktop = mql.matches;
      setIsDesktop(desktop);
      if (desktop) setSidebarOpen(false);
    }
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return (
    <SidebarContext.Provider value={{ sidebarOpen, setSidebarOpen, isDesktop }}>
      {children}
    </SidebarContext.Provider>
  );
}
