"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { MailPlus, Pencil, Plus, Search, Trash2 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import PageHeader from "@/components/ui/PageHeader";
import LoadingState from "@/components/ui/LoadingState";
import RichTextEditor from "@/components/compose/RichTextEditor";
import { useToast } from "@/components/ToastProvider";
import type { EmailTemplate } from "@/lib/types";

export default function TemplatesPage() {
  const { showToast } = useToast();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EmailTemplate | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadTemplates = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const url = q ? `/api/templates?q=${encodeURIComponent(q)}` : "/api/templates";
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load templates.");
      setTemplates(data.templates);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load templates.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const timeout = setTimeout(() => loadTemplates(search), 250);
    return () => clearTimeout(timeout);
  }, [search, loadTemplates]);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/templates/${deleteTarget._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete template.");
      showToast("Template deleted.", "success");
      setDeleteTarget(null);
      loadTemplates(search);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete template.", "error");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        kicker="Reusable content"
        title="Templates"
        description={`${templates.length} saved template${templates.length === 1 ? "" : "s"} for repeat campaigns, replies, and announcements.`}
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            New Template
          </Button>
        }
      />

      <div className="surface mb-4 flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="text-field pl-9"
          />
        </label>
        <div className="text-xs font-semibold uppercase text-stone-500" style={{ letterSpacing: "0.06em" }}>
          Draft library
        </div>
      </div>

      {loading ? (
        <LoadingState />
      ) : templates.length === 0 ? (
        <EmptyState
          title="No templates yet"
          description="Save your best campaign copy and reuse it from Compose."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              New Template
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {templates.map((template) => (
            <article key={template._id} className="surface p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-black text-stone-950">{template.name}</h2>
                    {template.category && <Badge tone="info">{template.category}</Badge>}
                  </div>
                  <p className="mt-1 text-sm font-semibold text-stone-700">{template.subject}</p>
                </div>
                <Link href={`/compose?templateId=${template._id}`}>
                  <Button variant="secondary">
                    <MailPlus className="h-4 w-4" />
                    Use
                  </Button>
                </Link>
              </div>
              <div
                className="prose prose-sm max-h-36 overflow-hidden border border-stone-100 bg-stone-50/70 p-3 prose-p:my-1"
                style={{ borderRadius: 8 }}
                dangerouslySetInnerHTML={{ __html: template.bodyHtml }}
              />
              <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
                <button
                  className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-950"
                  onClick={() => {
                    setEditing(template);
                    setModalOpen(true);
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  className="inline-flex items-center gap-1 text-red-700 hover:text-red-900"
                  onClick={() => setDeleteTarget(template)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <TemplateModal
        open={modalOpen}
        template={editing}
        onClose={() => setModalOpen(false)}
        onSaved={() => loadTemplates(search)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete template"
        message={`Delete "${deleteTarget?.name}"? Existing sent history will not be affected.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}

function TemplateModal({
  open,
  template,
  onClose,
  onSaved,
}: {
  open: boolean;
  template: EmailTemplate | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(template?.name ?? "");
    setSubject(template?.subject ?? "");
    setCategory(template?.category ?? "");
    setBodyHtml(template?.bodyHtml ?? "");
    setError(null);
  }, [open, template]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !subject.trim() || !bodyHtml.trim() || bodyHtml === "<p></p>") {
      const message = "Name, subject, and message are required.";
      setError(message);
      showToast(message, "warning");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const url = template ? `/api/templates/${template._id}` : "/api/templates";
      const method = template ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, subject, category, bodyHtml }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save template.");
      onSaved();
      onClose();
      showToast(template ? "Template updated." : "Template created.", "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save template.";
      setError(message);
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={template ? "Edit Template" : "New Template"}
      widthClassName="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="text-field" placeholder="Monthly newsletter" required />
          </div>
          <div>
            <label className="field-label">Category</label>
            <input value={category} onChange={(e) => setCategory(e.target.value)} className="text-field" placeholder="Sales, Welcome, Follow-up" />
          </div>
        </div>
        <div>
          <label className="field-label">Subject</label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} className="text-field" placeholder="Subject line" required />
        </div>
        <div>
          <label className="field-label">Message</label>
          <RichTextEditor content={bodyHtml} onChange={setBodyHtml} />
        </div>
        {error && <p className="text-sm font-semibold text-red-700">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            Save Template
          </Button>
        </div>
      </form>
    </Modal>
  );
}
