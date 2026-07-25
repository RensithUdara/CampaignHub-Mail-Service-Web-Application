"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  FileText,
  MailPlus,
  Send,
  Settings,
  Users,
  UserRound,
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import LoadingState from "@/components/ui/LoadingState";
import { useToast } from "@/components/ToastProvider";
import type { EmailStatus } from "@/lib/types";

type DashboardData = {
  stats: {
    contacts: number;
    groups: number;
    templates: number;
    totalSends: number;
    sent: number;
    partial: number;
    failed: number;
    recentRecipients: number;
  };
  recentLogs: {
    _id: string;
    subject: string;
    recipients: string[];
    status: EmailStatus;
    sentAt: string;
  }[];
};

const STATUS_TONE: Record<EmailStatus, "success" | "warning" | "error"> = {
  sent: "success",
  partial: "warning",
  failed: "error",
};

export default function DashboardPage() {
  const { showToast } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard", { cache: "no-store" });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to load dashboard.");
      setData(payload);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load dashboard.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const stats = data?.stats;
  const deliveryRate =
    stats && stats.totalSends > 0 ? Math.round((stats.sent / stats.totalSends) * 100) : 0;

  return (
    <div>
      <PageHeader
        kicker="Campaign cockpit"
        title="Dashboard"
        description="Track your audience, reusable content, and recent delivery activity from one command center."
        actions={
          <>
            <Link href="/compose">
              <Button>
                <MailPlus className="h-4 w-4" />
                Compose
              </Button>
            </Link>
            <Link href="/templates">
              <Button variant="secondary">
                <FileText className="h-4 w-4" />
                Templates
              </Button>
            </Link>
          </>
        }
      />

      {loading ? (
        <LoadingState />
      ) : !data || !stats ? (
        <div className="surface p-6 text-sm text-stone-600">
          Dashboard data is unavailable.
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Contacts"
              value={stats.contacts}
              detail="people in your address book"
              icon={<UserRound className="h-5 w-5" />}
              color="rose"
              href="/contacts"
            />
            <MetricCard
              title="Groups"
              value={stats.groups}
              detail="audience segments"
              icon={<Users className="h-5 w-5" />}
              color="amber"
              href="/groups"
            />
            <MetricCard
              title="Templates"
              value={stats.templates}
              detail="saved reusable messages"
              icon={<FileText className="h-5 w-5" />}
              color="fuchsia"
              href="/templates"
            />
            <MetricCard
              title="Total Sends"
              value={stats.totalSends}
              detail={`${deliveryRate}% fully sent`}
              icon={<Send className="h-5 w-5" />}
              color="teal"
              href="/history"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <section className="surface p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="page-kicker">Recent delivery</p>
                  <h2 className="text-xl font-black text-stone-950">Send activity</h2>
                </div>
                <Link href="/history" className="inline-flex items-center gap-1 text-sm font-bold text-teal-700 hover:text-teal-950">
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {data.recentLogs.length === 0 ? (
                <div className="surface-muted p-6 text-center text-sm text-stone-600">
                  No emails sent yet. Compose your first campaign to start building history.
                </div>
              ) : (
                <div className="table-shell shadow-none">
                  <table className="w-full text-left text-sm">
                    <thead className="table-head">
                      <tr>
                        <th className="px-4 py-3">Subject</th>
                        <th className="px-4 py-3">Recipients</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Sent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {data.recentLogs.map((log) => (
                        <tr key={log._id} className="table-row">
                          <td className="px-4 py-3 font-semibold text-stone-950">
                            {log.subject || "(no subject)"}
                          </td>
                          <td className="px-4 py-3 text-stone-600">
                            {log.recipients.length}
                          </td>
                          <td className="px-4 py-3">
                            <Badge tone={STATUS_TONE[log.status]}>{log.status}</Badge>
                          </td>
                          <td className="px-4 py-3 text-stone-500">
                            {new Date(log.sentAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <aside className="space-y-4">
              <section className="surface border-sky-100 bg-gradient-to-br from-white to-sky-50 p-4">
                <p className="page-kicker">Delivery health</p>
                <h2 className="mt-1 text-xl font-black text-stone-950">{deliveryRate}% sent</h2>
                <div className="mt-4 h-3 overflow-hidden bg-white ring-1 ring-sky-100" style={{ borderRadius: 999 }}>
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-sky-500"
                    style={{ width: `${deliveryRate}%` }}
                  />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <MiniStat label="Sent" value={stats.sent} tone="text-emerald-700" />
                  <MiniStat label="Partial" value={stats.partial} tone="text-amber-700" />
                  <MiniStat label="Failed" value={stats.failed} tone="text-rose-700" />
                </div>
              </section>

              <section className="surface border-violet-100 bg-gradient-to-br from-white to-violet-50 p-4">
                <p className="page-kicker">Quick setup</p>
                <div className="mt-3 space-y-2">
                  <QuickLink href="/contacts" icon={<UserRound className="h-4 w-4" />} label="Add contacts" />
                  <QuickLink href="/groups" icon={<Users className="h-4 w-4" />} label="Build a group" />
                  <QuickLink href="/settings" icon={<Settings className="h-4 w-4" />} label="Connect services" />
                </div>
              </section>
            </aside>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  title,
  value,
  detail,
  icon,
  color,
  href,
}: {
  title: string;
  value: number;
  detail: string;
  icon: ReactNode;
  color: "rose" | "amber" | "fuchsia" | "teal";
  href: string;
}) {
  const classes = {
    rose: "border-rose-100 bg-gradient-to-br from-white to-rose-50 text-rose-700",
    amber: "border-amber-100 bg-gradient-to-br from-white to-amber-50 text-amber-700",
    fuchsia: "border-fuchsia-100 bg-gradient-to-br from-white to-fuchsia-50 text-fuchsia-700",
    teal: "border-teal-100 bg-gradient-to-br from-white to-teal-50 text-teal-700",
  };

  return (
    <Link href={href} className={`metric-card ${classes[color]} block`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-black uppercase" style={{ letterSpacing: "0.06em" }}>
          {title}
        </p>
        {icon}
      </div>
      <p className="mt-3 text-3xl font-black text-stone-950">{value}</p>
      <p className="text-sm text-stone-500">{detail}</p>
    </Link>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="bg-white/80 p-2 ring-1 ring-stone-100" style={{ borderRadius: 8 }}>
      <p className={`text-lg font-black ${tone}`}>{value}</p>
      <p className="text-xs font-semibold text-stone-500">{label}</p>
    </div>
  );
}

function QuickLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between bg-white/80 px-3 py-2 text-sm font-bold text-stone-700 ring-1 ring-violet-100 hover:text-violet-800"
      style={{ borderRadius: 8 }}
    >
      <span className="inline-flex items-center gap-2">
        {icon}
        {label}
      </span>
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}
