"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Mail, Plus, Search, Trash2, Upload, UserPen } from "lucide-react";
import Button from "@/components/ui/Button";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Pagination from "@/components/ui/Pagination";
import PageHeader from "@/components/ui/PageHeader";
import ContactModal from "@/components/contacts/ContactModal";
import { useToast } from "@/components/ToastProvider";
import { Contact } from "@/lib/types";

const PAGE_SIZE = 10;

export default function ContactsPage() {
  const { showToast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [importing, setImporting] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  const loadContacts = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const url = q ? `/api/contacts?q=${encodeURIComponent(q)}` : "/api/contacts";
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load contacts.");
      setContacts(data.contacts);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load contacts.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    setPage(1);
    const timeout = setTimeout(() => loadContacts(search), 250);
    return () => clearTimeout(timeout);
  }, [search, loadContacts]);

  const totalPages = Math.max(1, Math.ceil(contacts.length / PAGE_SIZE));
  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);
  const pageContacts = contacts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function openAddModal() {
    setEditingContact(null);
    setModalOpen(true);
  }

  function openEditModal(contact: Contact) {
    setEditingContact(contact);
    setModalOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/contacts/${deleteTarget._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete contact.");
      showToast("Contact deleted.", "success");
      setDeleteTarget(null);
      loadContacts(search);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete contact.", "error");
    } finally {
      setDeleting(false);
    }
  }

  function handleExport() {
    window.location.href = "/api/contacts/export";
  }

  async function handleImport(file: File | undefined) {
    if (!file) return;
    setImporting(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const res = await fetch("/api/contacts/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to import contacts.");
      showToast(
        `Imported ${data.imported} contacts (${data.created} new, ${data.updated} updated, ${data.skipped} skipped).`,
        "success"
      );
      await loadContacts(search);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to import contacts.", "error");
    } finally {
      setImporting(false);
      if (importInputRef.current) importInputRef.current.value = "";
    }
  }

  return (
    <div>
      <input
        ref={importInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => handleImport(e.target.files?.[0])}
      />
      <PageHeader
        kicker="Address book"
        title="Contacts"
        description={`${contacts.length} contact${contacts.length === 1 ? "" : "s"} ready for campaigns, groups, and one-off sends.`}
        actions={
          <>
            <Button variant="secondary" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button
              variant="secondary"
              onClick={() => importInputRef.current?.click()}
              loading={importing}
            >
              <Upload className="h-4 w-4" />
              Import CSV
            </Button>
            <Button onClick={openAddModal}>
              <Plus className="h-4 w-4" />
              Add Contact
            </Button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="metric-card border-rose-100 bg-gradient-to-br from-white to-rose-50">
          <p className="text-xs font-black uppercase text-rose-600" style={{ letterSpacing: "0.06em" }}>Directory</p>
          <p className="mt-2 text-2xl font-black text-stone-950">{contacts.length}</p>
          <p className="text-sm text-stone-500">saved contacts</p>
        </div>
        <div className="metric-card border-amber-100 bg-gradient-to-br from-white to-amber-50">
          <p className="text-xs font-black uppercase text-amber-700" style={{ letterSpacing: "0.06em" }}>Tagged</p>
          <p className="mt-2 text-2xl font-black text-stone-950">
            {contacts.filter((contact) => contact.tags && contact.tags.length > 0).length}
          </p>
          <p className="text-sm text-stone-500">with labels</p>
        </div>
        <div className="metric-card border-sky-100 bg-gradient-to-br from-white to-sky-50">
          <p className="text-xs font-black uppercase text-sky-700" style={{ letterSpacing: "0.06em" }}>Search</p>
          <p className="mt-2 text-2xl font-black text-stone-950">{pageContacts.length}</p>
          <p className="text-sm text-stone-500">shown on this page</p>
        </div>
      </div>

      <div className="surface mb-4 flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="text-field pl-9"
          />
        </label>
        <div className="text-xs font-semibold uppercase text-stone-500" style={{ letterSpacing: "0.06em" }}>
          Live directory
        </div>
      </div>

      {loading ? (
        <LoadingState />
      ) : contacts.length === 0 ? (
        <EmptyState
          title="No contacts yet"
          description="Add your first contact to start building your address book."
          action={
            <Button onClick={openAddModal}>
              <Plus className="h-4 w-4" />
              Add Contact
            </Button>
          }
        />
      ) : (
        <div className="table-shell">
          <table className="w-full text-left text-sm">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Tags</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {pageContacts.map((contact) => (
                <tr key={contact._id} className="table-row">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center bg-teal-100 text-sm font-bold text-teal-800" style={{ borderRadius: 8 }}>
                        {contact.name.slice(0, 1).toUpperCase()}
                      </span>
                      <span className="font-semibold text-stone-950">{contact.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    <span className="inline-flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-stone-400" />
                      {contact.email}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-stone-600">{contact.phone || "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {contact.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="bg-stone-100 px-2 py-1 text-xs font-medium text-stone-600"
                          style={{ borderRadius: 999 }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEditModal(contact)}
                      className="mr-3 inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-950"
                    >
                      <UserPen className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(contact)}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-red-700 hover:text-red-900"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      <ContactModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => loadContacts(search)}
        contact={editingContact}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete contact"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This will also remove them from any groups.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
