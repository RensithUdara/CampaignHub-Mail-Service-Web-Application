"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ToastKind = "success" | "error" | "warning" | "info";

type Toast = {
  id: number;
  kind: ToastKind;
  message: string;
  leaving?: boolean;
};

type ToastContextValue = {
  showToast: (message: string, kind?: ToastKind) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 1;
const EXIT_DURATION = 180;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const lastInvalidToastRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, EXIT_DURATION);
  }, []);

  const showToast = useCallback((message: string, kind: ToastKind = "info") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, kind, message }]);
    setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  useEffect(() => {
    function onInvalid(event: Event) {
      event.preventDefault();
      const now = Date.now();
      if (now - lastInvalidToastRef.current < 1200) return;
      lastInvalidToastRef.current = now;

      const input = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      const label =
        input.getAttribute("aria-label") ||
        input.getAttribute("placeholder") ||
        input.name ||
        "required field";
      showToast(`Please complete ${label}.`, "warning");
    }

    function onUnhandledRejection(event: PromiseRejectionEvent) {
      const message =
        event.reason instanceof Error
          ? event.reason.message
          : typeof event.reason === "string"
          ? event.reason
          : "An unexpected action error occurred.";
      showToast(message, "error");
    }

    function onWindowError(event: ErrorEvent) {
      showToast(event.message || "An unexpected app error occurred.", "error");
    }

    document.addEventListener("invalid", onInvalid, true);
    window.addEventListener("unhandledrejection", onUnhandledRejection);
    window.addEventListener("error", onWindowError);

    return () => {
      document.removeEventListener("invalid", onInvalid, true);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
      window.removeEventListener("error", onWindowError);
    };
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[120] flex w-[min(420px,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            onClick={() => dismiss(t.id)}
            className={`cursor-pointer border px-4 py-3 text-sm font-bold shadow-xl backdrop-blur ${
              t.leaving ? "animate-toast-out" : "animate-toast-in"
            } ${
              t.kind === "success"
                ? "border-emerald-200 bg-emerald-600 text-white"
                : t.kind === "error"
                ? "border-red-200 bg-red-600 text-white"
                : t.kind === "warning"
                ? "border-amber-200 bg-amber-500 text-white"
                : "border-slate-700 bg-slate-900 text-white"
            }`}
            style={{ borderRadius: 8 }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
