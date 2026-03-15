"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Timer } from "lucide-react";

const timeoutMinutes =
  Number(process.env.NEXT_PUBLIC_INACTIVITY_TIMEOUT_MINUTES) || 15;
const warningSeconds =
  Number(process.env.NEXT_PUBLIC_INACTIVITY_WARNING_SECONDS) || 60;

const IDLE_MS = timeoutMinutes * 60 * 1000;
const THROTTLE_MS = 1000;

function useThrottledActivity(onActivity: () => void) {
  const lastCall = useRef(0);
  const onActivityRef = useRef(onActivity);
  onActivityRef.current = onActivity;

  const throttled = useCallback(() => {
    const now = Date.now();
    if (now - lastCall.current >= THROTTLE_MS) {
      lastCall.current = now;
      onActivityRef.current();
    }
  }, []);

  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, throttled));
    return () => events.forEach((e) => window.removeEventListener(e, throttled));
  }, [throttled]);
}

async function doLogout() {
  try {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
  } finally {
    window.location.href = "/";
  }
}

export function InactivityWatcher() {
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(warningSeconds);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
    if (showModal) return;
    idleTimerRef.current = setTimeout(() => {
      idleTimerRef.current = null;
      setShowModal(true);
      setCountdown(warningSeconds);
    }, IDLE_MS);
  }, [showModal]);

  const stopCountdown = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  }, []);

  useThrottledActivity(() => {
    if (showModal) return;
    resetIdleTimer();
  });

  useEffect(() => {
    if (!showModal) {
      resetIdleTimer();
      return () => {
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      };
    }
    return undefined;
  }, [showModal, resetIdleTimer]);

  useEffect(() => {
    if (!showModal) return;
    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          stopCountdown();
          doLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => stopCountdown();
  }, [showModal, stopCountdown]);

  const handleStayOnline = useCallback(() => {
    stopCountdown();
    setShowModal(false);
    setCountdown(warningSeconds);
    // Idle timer is restarted by the useEffect when showModal becomes false
  }, [stopCountdown]);

  const handleLogout = useCallback(() => {
    stopCountdown();
    doLogout();
  }, [stopCountdown]);

  if (!showModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inactivity-title"
    >
      <div
        className="w-full max-w-md rounded-xl border border-border bg-surface-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary">
            <Timer className="h-5 w-5" aria-hidden />
          </div>
          <h2
            id="inactivity-title"
            className="font-heading text-lg font-semibold text-text-primary"
          >
            Session timeout
          </h2>
        </div>
        <p className="mt-2 text-sm text-text-secondary">
          You have been inactive. You will be logged out in{" "}
          <span className="font-medium text-text-primary">{countdown}</span>{" "}
          seconds.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleStayOnline}
            className="rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Stay online
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-border bg-surface-card px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface-hover"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
