"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Clock3, SlidersHorizontal } from "lucide-react";
import LoadingState from "@/components/ui/LoadingState";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import PageHeader from "@/components/ui/PageHeader";
import { useToast } from "@/components/ToastProvider";
import { EmailLog, EmailStatus } from "@/lib/types";

const PAGE_SIZE = 10;

const STATUS_TONE: Record<EmailStatus, "success" | "error" | "warning"> = {
  sent: "success",
  failed: "error",
  partial: "warning",
};

const FILTERS: { label: string; value: "all" | EmailStatus }[] = [
  { label: "All", value: "all" },
  { label: "Sent", value: "sent" },
  { label: "Partial", value: "partial" },
  { label: "Failed", value: "failed" },
];

export default function HistoryPage() {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | EmailStatus>("all");
  const [page, setPage] = useState(1);

  const loadLogs = useCallback(async (status: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/logs?status=${status}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load history.");
      setLogs(data.logs);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load history.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    setPage(1);
    loadLogs(filter);
  }, [filter, loadLogs]);

  const totalPages = Math.max(1, Math.ceil(logs.length / PAGE_SIZE));
  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);
  const pageLogs = logs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <PageHeader
        kicker="Delivery archive"
        title="Send History"
        description="Review every send, status, recipient count, and timestamp from the local mail workflow."
      />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="metric-card border-stone-100 bg-gradient-to-br from-white to-stone-50">
          <p className="text-xs font-black uppercase text-stone-600" style={{ letterSpacing: "0.06em" }}>All</p>
          <p className="mt-2 text-2xl font-black text-stone-950">{logs.length}</p>
          <p className="text-sm text-stone-500">matching sends</p>
        </div>
        <div className="metric-card border-emerald-100 bg-gradient-to-br from-white to-emerald-50">
          <p className="text-xs font-black uppercase text-emerald-700" style={{ letterSpacing: "0.06em" }}>Sent</p>
          <p className="mt-2 text-2xl font-black text-stone-950">{logs.filter((log) => log.status === "sent").length}</p>
          <p className="text-sm text-stone-500">completed</p>
        </div>
        <div className="metric-card border-amber-100 bg-gradient-to-br from-white to-amber-50">
          <p className="text-xs font-black uppercase text-amber-700" style={{ letterSpacing: "0.06em" }}>Partial</p>
          <p className="mt-2 text-2xl font-black text-stone-950">{logs.filter((log) => log.status === "partial").length}</p>
          <p className="text-sm text-stone-500">mixed status</p>
        </div>
        <div className="metric-card border-rose-100 bg-gradient-to-br from-white to-rose-50">
          <p className="text-xs font-black uppercase text-rose-700" style={{ letterSpacing: "0.06em" }}>Failed</p>
          <p className="mt-2 text-2xl font-black text-stone-950">{logs.filter((log) => log.status === "failed").length}</p>
          <p className="text-sm text-stone-500">needs review</p>
        </div>
      </div>

      <div className="surface mb-4 flex flex-wrap items-center gap-2 p-2">
        <div className="mr-1 flex items-center gap-2 px-2 text-xs font-semibold uppercase text-stone-500" style={{ letterSpacing: "0.06em" }}>
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filter
        </div>
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-2 text-sm font-semibold transition-colors ${
              filter === f.value
                ? "bg-teal-700 text-white"
                : "text-stone-600 hover:bg-stone-100 hover:text-stone-950"
            }`}
            style={{ borderRadius: 8 }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState />
      ) : logs.length === 0 ? (
        <EmptyState
          title="No emails sent yet"
          description="Emails you send from Compose will show up here."
        />
      ) : (
        <div className="table-shell">
          <table className="w-full text-left text-sm">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Recipients</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Sent At</th>
                <th className="px-4 py-3 text-right">Open</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {pageLogs.map((log) => (
                <tr key={log._id} className="table-row">
                  <td className="px-4 py-3">
                    <Link href={`/history/${log._id}`} className="font-semibold text-stone-950 hover:text-teal-800">
                      {log.subject || "(no subject)"}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    {log.recipients.length} recipient{log.recipients.length === 1 ? "" : "s"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONE[log.status]}>{log.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-stone-500">
                    <span className="inline-flex items-center gap-2">
                      <Clock3 className="h-3.5 w-3.5" />
                      {new Date(log.sentAt).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/history/${log._id}`} className="inline-flex items-center justify-end gap-1 font-semibold text-teal-700 hover:text-teal-950">
                      Details
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
