export type ToastPayload = {
  message: string;
  variant?: "error" | "success" | "info";
  durationMs?: number;
};

export const TOAST_EVENT = "booking:toast";

export function showToast(payload: ToastPayload) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent<ToastPayload>(TOAST_EVENT, { detail: payload }));
}
