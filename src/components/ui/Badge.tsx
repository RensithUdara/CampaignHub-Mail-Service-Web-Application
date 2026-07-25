import { ReactNode } from "react";

type Tone = "success" | "error" | "warning" | "neutral" | "info";

const TONE_CLASSES: Record<Tone, string> = {
  success:
    "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  error: "bg-red-50 text-red-700 ring-1 ring-red-200",
  warning:
    "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  neutral:
    "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  info: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
};

export default function Badge({
  tone = "neutral",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold ${TONE_CLASSES[tone]}`}
      style={{ borderRadius: 999 }}
    >
      {children}
    </span>
  );
}
