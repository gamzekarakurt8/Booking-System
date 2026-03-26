"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { TOAST_EVENT, type ToastPayload } from "../../lib/toast";

type ToastItem = ToastPayload & {
  id: number;
};

type ToastEvent = CustomEvent<ToastPayload>;

const DEFAULT_DURATION_MS = 4000;

export function ToastViewport() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<number, number>>(new Map());

  useEffect(() => {
    const removeToast = (id: number) => {
      const timerId = timersRef.current.get(id);
      if (timerId) {
        window.clearTimeout(timerId);
        timersRef.current.delete(id);
      }

      setToasts((current) => current.filter((item) => item.id !== id));
    };

    const handleToast = (event: Event) => {
      const detail = (event as ToastEvent).detail;
      if (!detail?.message) {
        return;
      }

      const id = Date.now() + Math.floor(Math.random() * 1000);
      const nextToast: ToastItem = {
        id,
        message: detail.message,
        variant: detail.variant ?? "error",
        durationMs: detail.durationMs ?? DEFAULT_DURATION_MS,
      };

      setToasts((current) => [...current, nextToast]);

      const timerId = window.setTimeout(() => {
        removeToast(id);
      }, nextToast.durationMs);

      timersRef.current.set(id, timerId);
    };

    window.addEventListener(TOAST_EVENT, handleToast as EventListener);

    return () => {
      window.removeEventListener(TOAST_EVENT, handleToast as EventListener);

      for (const timerId of timersRef.current.values()) {
        window.clearTimeout(timerId);
      }

      timersRef.current.clear();
    };
  }, []);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[70] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={clsx(
            "rounded-xl border px-4 py-3 text-sm shadow-card backdrop-blur-sm animate-fade-up",
            toast.variant === "error" && "border-[#7b2416] bg-[#a63522] text-white",
            toast.variant === "success" && "border-[#285c36] bg-[#3f7a50] text-white",
            toast.variant === "info" && "border-[#2a4f74] bg-[#3f6a95] text-white",
          )}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
