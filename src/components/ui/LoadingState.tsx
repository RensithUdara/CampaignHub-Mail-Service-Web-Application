import Image from "next/image";
import logo from "@/images/campaignhub-logo.png";

export default function LoadingState({
  title = "Loading workspace",
  message = "Preparing CampaignHub data...",
  compact = false,
}: {
  title?: string;
  message?: string;
  compact?: boolean;
}) {
  return (
    <div className={`flex w-full items-center justify-center ${compact ? "py-8" : "min-h-[420px] py-16"}`}>
      <div className="relative flex flex-col items-center text-center">
        <div className="absolute h-28 w-28 animate-ping bg-blue-500/10" style={{ borderRadius: 999 }} />
        <div className="relative flex h-24 w-24 items-center justify-center bg-slate-950 shadow-[0_22px_55px_rgba(15,23,42,0.22)] ring-1 ring-cyan-400/20" style={{ borderRadius: 8 }}>
          <div className="absolute inset-2 animate-spin border-2 border-transparent border-t-blue-500 border-r-cyan-400" style={{ borderRadius: 8 }} />
          <Image src={logo} alt="CampaignHub" width={42} height={42} className="relative h-11 w-11 object-contain" />
        </div>
        <div className="mt-5">
          <p className="text-sm font-black uppercase text-blue-700" style={{ letterSpacing: "0.08em" }}>
            {title}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-500">{message}</p>
        </div>
        <div className="mt-4 flex gap-1.5">
          <span className="h-2 w-2 animate-bounce bg-blue-600" style={{ borderRadius: 999 }} />
          <span className="h-2 w-2 animate-bounce bg-cyan-500 [animation-delay:120ms]" style={{ borderRadius: 999 }} />
          <span className="h-2 w-2 animate-bounce bg-emerald-500 [animation-delay:240ms]" style={{ borderRadius: 999 }} />
        </div>
      </div>
    </div>
  );
}
