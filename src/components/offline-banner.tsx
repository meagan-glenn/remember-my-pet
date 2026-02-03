"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-600 text-white px-4 py-3 shadow-md">
      <div className="flex items-center justify-center gap-2 text-sm font-medium">
        <WifiOff className="h-4 w-4 shrink-0" />
        <span>You&apos;re offline. Your work is saved on this device.</span>
      </div>
    </div>
  );
}
