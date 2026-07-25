"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import {
  Clock3,
  FileText,
  LayoutDashboard,
  MailPlus,
  Settings,
  Sparkles,
  Users,
  UserRound,
} from "lucide-react";
import logo from "@/images/campaignhub-logo.png";

const NAV_GROUPS = [
  {
    label: "Workspace",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard, accent: "from-sky-500 to-blue-600" },
      { href: "/compose", label: "Compose", icon: MailPlus, accent: "from-emerald-500 to-teal-600" },
      { href: "/templates", label: "Templates", icon: FileText, accent: "from-fuchsia-500 to-violet-600" },
    ],
  },
  {
    label: "Audience",
    items: [
      { href: "/contacts", label: "Contacts", icon: UserRound, accent: "from-rose-500 to-red-600" },
      { href: "/groups", label: "Groups", icon: Users, accent: "from-amber-500 to-orange-600" },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/history", label: "History", icon: Clock3, accent: "from-cyan-500 to-sky-600" },
      { href: "/settings", label: "Settings", icon: Settings, accent: "from-slate-500 to-slate-700" },
    ],
  },
];

const MOBILE_ITEMS = NAV_GROUPS.flatMap((group) => group.items);

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden h-screen w-[18.5rem] border-r border-slate-200/80 bg-slate-950 p-3 text-slate-100 lg:block">
        <div className="flex h-full flex-col overflow-hidden border border-white/10 bg-white/[0.03] shadow-2xl" style={{ borderRadius: 8 }}>
          <div className="p-4">
            <Link href="/" className="flex items-center gap-3">
              <span className="animate-logo-pop inline-flex h-11 w-11 shrink-0 items-center justify-center bg-slate-900/80 p-1 shadow-lg ring-1 ring-cyan-400/25" style={{ borderRadius: 8 }}>
                <Image src={logo} alt="CampaignHub" width={36} height={36} priority className="h-9 w-9 object-contain" />
              </span>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-black text-white">CampaignHub</h1>
                <p className="truncate text-xs font-medium text-slate-400">Email growth console</p>
              </div>
            </Link>

            <div className="mt-4 border border-white/10 bg-gradient-to-br from-blue-500/15 via-cyan-400/10 to-emerald-400/15 p-3" style={{ borderRadius: 8 }}>
              <div className="flex items-center gap-2 text-xs font-black uppercase text-cyan-100" style={{ letterSpacing: "0.08em" }}>
                <Sparkles className="h-3.5 w-3.5" />
                Campaign workspace
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                Compose, segment, reuse templates, and track sends from one local desktop product.
              </p>
            </div>
          </div>

          <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-3">
            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="mb-2 px-2 text-[11px] font-black uppercase text-slate-500" style={{ letterSpacing: "0.10em" }}>
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <NavItem key={item.href} item={item} pathname={pathname} />
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      <nav className="fixed inset-x-2 bottom-2 z-30 grid grid-cols-7 gap-1 border border-slate-800 bg-slate-950/95 p-1 text-slate-200 shadow-2xl backdrop-blur lg:hidden" style={{ borderRadius: 8 }}>
        {MOBILE_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-12 flex-col items-center justify-center gap-1 px-1 text-[10px] font-bold transition-colors ${
                active ? `bg-gradient-to-br ${item.accent} text-white` : "text-slate-400 hover:bg-white/10 hover:text-white"
              }`}
              style={{ borderRadius: 7 }}
            >
              <Icon className="h-4 w-4" />
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

function NavItem({
  item,
  pathname,
}: {
  item: {
    href: string;
    label: string;
    icon: ComponentType<{ className?: string }>;
    accent: string;
  };
  pathname: string | null;
}) {
  const Icon = item.icon;
  const active = isActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      className={`group relative flex items-center gap-3 px-3 py-2.5 text-sm font-bold transition-all ${
        active
          ? "bg-white text-slate-950 shadow-[0_12px_30px_rgba(0,0,0,0.22)]"
          : "text-slate-400 hover:bg-white/10 hover:text-white"
      }`}
      style={{ borderRadius: 8 }}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center bg-gradient-to-br ${item.accent} text-white shadow-sm`}
        style={{ borderRadius: 8 }}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span>{item.label}</span>
      {active && <span className="ml-auto h-2 w-2 bg-slate-950" style={{ borderRadius: 999 }} />}
    </Link>
  );
}

function isActive(pathname: string | null, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname?.startsWith(`${href}/`);
}
