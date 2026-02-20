"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getSnapshot() {
  return !navigator.onLine;
}

function getServerSnapshot() {
  return false;
}

export function OfflineBanner() {
  const isOffline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!isOffline) return null;

  return (
    <div
      className="fixed top-0 inset-x-0 z-[70] flex items-center justify-center py-2 bg-[var(--color-warning)] text-white text-sm font-medium"
      style={{ paddingTop: "calc(var(--safe-area-top) + 8px)" }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mr-2"
      >
        <path d="M2 12 7 2h10l5 10-5 10H7z" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
      Internetga ulanish yo&apos;q
    </div>
  );
}
