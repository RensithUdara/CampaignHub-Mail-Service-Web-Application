"use client";

import { X } from "lucide-react";
import { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  widthClassName?: string;
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  widthClassName = "max-w-md",
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const focusable = panelRef.current?.querySelector<HTMLElement>(
      "input, textarea, select, button:not([aria-label='Close'])"
    );
    focusable?.focus();
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      onClick={onClose}
      className="animate-modal-backdrop fixed inset-0 z-[100] flex min-h-dvh items-center justify-center bg-stone-950/55 px-4 py-6 backdrop-blur-md"
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className={`animate-modal-panel max-h-[calc(100dvh-3rem)] w-full ${widthClassName} overflow-y-auto border border-stone-200 bg-[#fffdf8] p-6 shadow-2xl`}
        style={{ borderRadius: 8 }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-stone-950">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
            style={{ borderRadius: 8 }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
