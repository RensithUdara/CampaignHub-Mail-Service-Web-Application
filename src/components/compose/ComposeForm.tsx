"use client";

import { useEffect, useState } from "react";
import { FileText, Paperclip, Save, Send, ShieldCheck, Trash2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import PageHeader from "@/components/ui/PageHeader";
import RecipientPicker from "@/components/compose/RecipientPicker";
import RichTextEditor from "@/components/compose/RichTextEditor";
import { useToast } from "@/components/ToastProvider";
import type { EmailTemplate, PerRecipientResult } from "@/lib/types";

type SendResult = {
  status: "sent" | "failed" | "partial";
  perRecipient: PerRecipientResult[];
};

export default function ComposeForm() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(new Set());
  const [useBcc, setUseBcc] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [templateId, setTemplateId] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [savingTemplate, setSavingTemplate] = useState(false);

  useEffect(() => {
    const groupId = searchParams.get("groupId");
    if (groupId) {
      setSelectedGroupIds(new Set([groupId]));
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadTemplates() {
      try {
        const res = await fetch("/api/templates", { cache: "no-store" });
        const data = await res.json();
        if (res.ok) setTemplates(data.templates ?? []);
      } catch {
        // Templates are optional for composing; avoid blocking email drafting.
      }
    }
    loadTemplates();
  }, []);

  useEffect(() => {
    const id = searchParams.get("templateId");
    if (!id || templates.length === 0) return;
    const template = templates.find((item) => item._id === id);
    if (template) {
      applyTemplate(template);
      setTemplateId(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, templates]);

  function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setFiles((prev) => [...prev, ...Array.from(fileList)]);
    setFileInputKey((k) => k + 1);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setFileInputKey((k) => k + 1);
  }

  const recipientCount = selectedContactIds.size + selectedGroupIds.size;

  async function handleSend() {
    setError(null);
    setResult(null);

    if (!subject.trim()) {
      const message = "Subject is required.";
      setError(message);
      showToast(message, "warning");
      return;
    }
    if (!bodyHtml || bodyHtml === "<p></p>") {
      const message = "Email body cannot be empty.";
      setError(message);
      showToast(message, "warning");
      return;
    }
    if (recipientCount === 0) {
      const message = "Select at least one contact or group.";
      setError(message);
      showToast(message, "warning");
      return;
    }

    setSending(true);
    try {
      const formData = new FormData();
      formData.set("subject", subject);
      formData.set("bodyHtml", bodyHtml);
      formData.set("useBcc", String(useBcc));
      formData.set("contactIds", JSON.stringify(Array.from(selectedContactIds)));
      formData.set("groupIds", JSON.stringify(Array.from(selectedGroupIds)));
      files.forEach((file) => formData.append("attachments", file));

      const res = await fetch("/api/send", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok && !data.result) {
        throw new Error(data.error || "Failed to send email.");
      }

      setResult(data.result);
      if (data.result.status === "sent") {
        showToast("Email sent successfully.", "success");
        setSubject("");
        setBodyHtml("");
        setSelectedContactIds(new Set());
        setSelectedGroupIds(new Set());
        setFiles([]);
        setFileInputKey((k) => k + 1);
      } else if (data.result.status === "partial") {
        showToast("Email sent with some failures.", "info");
      } else {
        showToast("Failed to send email.", "error");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send email.";
      setError(message);
      showToast(message, "error");
    } finally {
      setSending(false);
    }
  }

  function applyTemplate(template: EmailTemplate) {
    setSubject(template.subject);
    setBodyHtml(template.bodyHtml);
    setTemplateName(template.name);
    showToast(`Loaded "${template.name}".`, "success");
  }

  async function handleSaveTemplate() {
    if (!templateName.trim()) {
      const message = "Template name is required.";
      setError(message);
      showToast(message, "warning");
      return;
    }
    if (!subject.trim() || !bodyHtml || bodyHtml === "<p></p>") {
      const message = "Add a subject and message before saving a template.";
      setError(message);
      showToast(message, "warning");
      return;
    }
    setSavingTemplate(true);
    setError(null);
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: templateName, subject, bodyHtml, category: "Compose" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save template.");
      setTemplates((prev) => [data.template, ...prev]);
      setTemplateId(data.template._id);
      showToast("Template saved.", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save template.", "error");
    } finally {
      setSavingTemplate(false);
    }
  }

  return (
    <div>
      <PageHeader
        kicker="Outbound desk"
        title="Compose"
        description="Build a polished email, choose contacts or groups, attach files, and send through your configured Gmail account."
        actions={
          <Button onClick={handleSend} loading={sending}>
            <Send className="h-4 w-4" />
            Send Email
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="surface p-4 sm:p-5">
          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="metric-card border-teal-100 bg-gradient-to-br from-white to-teal-50">
              <p className="text-xs font-black uppercase text-teal-700" style={{ letterSpacing: "0.06em" }}>Audience</p>
              <p className="mt-2 text-2xl font-black text-stone-950">{recipientCount}</p>
              <p className="text-sm text-stone-500">selected targets</p>
            </div>
            <div className="metric-card border-rose-100 bg-gradient-to-br from-white to-rose-50">
              <p className="text-xs font-black uppercase text-rose-700" style={{ letterSpacing: "0.06em" }}>Files</p>
              <p className="mt-2 text-2xl font-black text-stone-950">{files.length}</p>
              <p className="text-sm text-stone-500">attachments</p>
            </div>
            <div className="metric-card border-sky-100 bg-gradient-to-br from-white to-sky-50">
              <p className="text-xs font-black uppercase text-sky-700" style={{ letterSpacing: "0.06em" }}>Privacy</p>
              <p className="mt-2 text-2xl font-black text-stone-950">{useBcc ? "BCC" : "TO"}</p>
              <p className="text-sm text-stone-500">send mode</p>
            </div>
          </div>
          <div className="space-y-5">
            <div>
              <label className="field-label">Subject</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
                className="text-field"
              />
            </div>

            <div>
              <label className="field-label">Message</label>
              <RichTextEditor content={bodyHtml} onChange={setBodyHtml} />
            </div>

            <div>
              <label className="field-label">
                Attachments <span className="text-stone-400">(optional)</span>
              </label>
              <label className="flex cursor-pointer items-center justify-between gap-3 border border-dashed border-stone-300 bg-stone-50/70 px-3 py-3 text-sm text-stone-600 transition hover:bg-stone-100" style={{ borderRadius: 8 }}>
                <span className="inline-flex items-center gap-2 font-medium">
                  <Paperclip className="h-4 w-4 text-teal-700" />
                  Choose files
                </span>
                <span className="text-xs text-stone-500">{files.length} selected</span>
                <input
                  key={fileInputKey}
                  type="file"
                  multiple
                  onChange={(e) => handleFilesSelected(e.target.files)}
                  className="sr-only"
                />
              </label>
              {files.length > 0 && (
                <ul className="mt-2 space-y-2">
                  {files.map((file, i) => (
                    <li
                      key={`${file.name}-${i}`}
                      className="flex items-center justify-between gap-3 bg-white px-3 py-2 text-sm ring-1 ring-stone-200"
                      style={{ borderRadius: 8 }}
                    >
                      <span className="truncate text-stone-700">
                        {file.name} <span className="text-xs text-stone-400">({(file.size / 1024).toFixed(1)} KB)</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 hover:text-red-900"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {error && <p className="text-sm font-medium text-red-700">{error}</p>}
          </div>
        </section>

        <aside className="space-y-4">
          <section className="surface border-fuchsia-100 bg-gradient-to-br from-white to-fuchsia-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="page-kicker">Templates</p>
                <h2 className="text-lg font-semibold text-stone-950">Message library</h2>
              </div>
              <FileText className="h-5 w-5 text-fuchsia-700" />
            </div>
            <div className="space-y-3">
              <select
                value={templateId}
                onChange={(e) => {
                  setTemplateId(e.target.value);
                  const template = templates.find((item) => item._id === e.target.value);
                  if (template) applyTemplate(template);
                }}
                className="text-field"
              >
                <option value="">Choose a template...</option>
                {templates.map((template) => (
                  <option key={template._id} value={template._id}>
                    {template.name}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <input
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Template name"
                  className="text-field min-w-0"
                />
                <Button type="button" onClick={handleSaveTemplate} loading={savingTemplate}>
                  <Save className="h-4 w-4" />
                  Save
                </Button>
              </div>
            </div>
          </section>

          <section className="surface border-teal-100 bg-gradient-to-br from-white to-teal-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="page-kicker">Recipients</p>
                <h2 className="text-lg font-semibold text-stone-950">Target audience</h2>
              </div>
              <Badge tone={recipientCount > 0 ? "info" : "neutral"}>{recipientCount} selected</Badge>
            </div>
            <RecipientPicker
              selectedContactIds={selectedContactIds}
              selectedGroupIds={selectedGroupIds}
              onChangeContacts={setSelectedContactIds}
              onChangeGroups={setSelectedGroupIds}
            />
            <label className="mt-3 flex items-center gap-2 border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-medium text-stone-600" style={{ borderRadius: 8 }}>
              <input
                type="checkbox"
                checked={useBcc}
                onChange={(e) => setUseBcc(e.target.checked)}
                className="h-4 w-4 rounded border-stone-300 text-teal-700 focus:ring-teal-600"
              />
              <ShieldCheck className="h-4 w-4 text-teal-700" />
              Send via BCC for group privacy
            </label>
          </section>

          {result && (
            <section className="surface border-amber-100 bg-gradient-to-br from-white to-amber-50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <h3 className="text-sm font-semibold text-stone-900">Send results</h3>
                <Badge tone={result.status === "sent" ? "success" : result.status === "partial" ? "warning" : "error"}>
                  {result.status}
                </Badge>
              </div>
              <ul className="space-y-2">
                {result.perRecipient.map((r) => (
                  <li key={r.email} className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate text-stone-700">{r.email}</span>
                    {r.success ? <Badge tone="success">Sent</Badge> : <Badge tone="error">Failed</Badge>}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
