"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Mail } from "lucide-react";
import LoadingState from "@/components/ui/LoadingState";
import Badge from "@/components/ui/Badge";
import PageHeader from "@/components/ui/PageHeader";
import { useToast } from "@/components/ToastProvider";
import { EmailLog, EmailStatus } from "@/lib/types";

const STATUS_TONE: Record<EmailStatus, "success" | "error" | "warning"> = {
  sent: "success",
  failed: "error",
  partial: "warning",
};

export default function HistoryDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const [log, setLog] = useState<EmailLog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/logs/${params.id}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load email.");
        setLog(data.log);
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Failed to load email.", "error");
        router.push("/history");
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (loading) {
    return (
      <LoadingState />
    );
  }

  if (!log) return null;

  return (
    <div>
      <Link href="/history" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-950">
        <ArrowLeft className="h-4 w-4" />
        Back to history
      </Link>

      <PageHeader
        kicker={`Sent ${new Date(log.sentAt).toLocaleString()}`}
        title={log.subject || "(no subject)"}
        description={log.errorMessage || `${log.recipients.length} recipient${log.recipients.length === 1 ? "" : "s"} in this send.`}
        actions={<Badge tone={STATUS_TONE[log.status]}>{log.status}</Badge>}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h3 className="mb-2 text-sm font-semibold text-stone-700">Message</h3>
          <div
            className="prose prose-sm surface max-w-none p-4 prose-headings:text-stone-950 prose-p:text-stone-700 prose-a:text-teal-700"
            dangerouslySetInnerHTML={{ __html: log.bodyHtml }}
          />
          {log.attachments && log.attachments.length > 0 && (
            <div className="mt-4">
              <h3 className="mb-2 text-sm font-semibold text-stone-700">Attachments</h3>
              <ul className="space-y-2">
                {log.attachments.map((a) => (
                  <li
                    key={a.name}
                    className="flex items-center justify-between gap-3 bg-white px-3 py-2 text-sm ring-1 ring-stone-200"
                    style={{ borderRadius: 8 }}
                  >
                    <span className="truncate text-stone-600">
                      {a.name}
                      {typeof a.size === "number" && (
                        <span className="ml-1.5 text-xs text-stone-400">({(a.size / 1024).toFixed(1)} KB)</span>
                      )}
                    </span>
                    {a.url ? (
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-950"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        View
                      </a>
                    ) : (
                      <span className="shrink-0 text-xs text-red-600" title={a.uploadError}>
                        Upload failed
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-stone-700">Recipients ({log.recipients.length})</h3>
          <div className="surface max-h-96 overflow-y-auto">
            <ul className="divide-y divide-stone-100">
              {(log.perRecipient && log.perRecipient.length > 0
                ? log.perRecipient
                : log.recipients.map((email) => ({ email, success: true }))
              ).map((r) => (
                <li key={r.email} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                  <span className="inline-flex min-w-0 items-center gap-2 truncate text-stone-700">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-stone-400" />
                    {r.email}
                  </span>
                  {r.success ? <Badge tone="success">Sent</Badge> : <Badge tone="error">Failed</Badge>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
