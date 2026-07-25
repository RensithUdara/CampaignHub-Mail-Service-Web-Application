"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MailPlus, Plus, Search, UserMinus, UserPlus } from "lucide-react";
import Button from "@/components/ui/Button";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import PageHeader from "@/components/ui/PageHeader";
import { useToast } from "@/components/ToastProvider";
import { Contact, Group } from "@/lib/types";

export default function GroupDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadGroup = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/groups/${params.id}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load group.");
      setGroup(data.group);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load group.", "error");
      router.push("/groups");
    } finally {
      setLoading(false);
    }
  }, [params.id, router, showToast]);

  useEffect(() => {
    loadGroup();
  }, [loadGroup]);

  async function openAddModal() {
    setAddModalOpen(true);
    try {
      const res = await fetch("/api/contacts", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load contacts.");
      setAllContacts(data.contacts);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load contacts.", "error");
    }
  }

  const memberIds = new Set((group?.contactIds as Contact[] | undefined)?.map((c) => c._id) ?? []);

  async function addMember(contactId: string) {
    setBusyId(contactId);
    try {
      const res = await fetch(`/api/groups/${params.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add member.");
      setGroup(data.group);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to add member.", "error");
    } finally {
      setBusyId(null);
    }
  }

  async function removeMember(contactId: string) {
    setBusyId(contactId);
    try {
      const res = await fetch(`/api/groups/${params.id}/members`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove member.");
      setGroup(data.group);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to remove member.", "error");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <LoadingState />
    );
  }

  if (!group) return null;

  const members = (group.contactIds as Contact[]) ?? [];
  const filteredContacts = allContacts.filter((c) => {
    const matchesSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div>
      <Link href="/groups" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-950">
        <ArrowLeft className="h-4 w-4" />
        Back to groups
      </Link>

      <PageHeader
        kicker={`${members.length} member${members.length === 1 ? "" : "s"}`}
        title={group.name}
        description={group.description || "Manage members and send a targeted group email."}
        actions={
          <>
            <Button variant="secondary" onClick={openAddModal}>
              <UserPlus className="h-4 w-4" />
              Add Members
            </Button>
            <Link href={`/compose?groupId=${group._id}`}>
              <Button>
                <MailPlus className="h-4 w-4" />
                Email this group
              </Button>
            </Link>
          </>
        }
      />

      {members.length === 0 ? (
        <EmptyState
          title="No members yet"
          description="Add contacts to this group so you can email them all at once."
          action={
            <Button onClick={openAddModal}>
              <Plus className="h-4 w-4" />
              Add Members
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
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {members.map((member) => (
                <tr key={member._id} className="table-row">
                  <td className="px-4 py-3 font-semibold text-stone-950">
                    <span className="inline-flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center bg-teal-100 text-xs font-bold text-teal-800" style={{ borderRadius: 8 }}>
                        {member.name.slice(0, 1).toUpperCase()}
                      </span>
                      {member.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-stone-600">{member.email}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      disabled={busyId === member._id}
                      onClick={() => removeMember(member._id)}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-red-700 hover:text-red-900 disabled:opacity-50"
                    >
                      <UserMinus className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add Members" widthClassName="max-w-lg">
        <label className="relative mb-3 block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts..."
            className="text-field pl-9"
          />
        </label>
        <div className="max-h-80 space-y-1 overflow-y-auto">
          {filteredContacts.length === 0 && (
            <p className="py-4 text-center text-sm text-stone-500">No contacts found.</p>
          )}
          {filteredContacts.map((contact) => {
            const isMember = memberIds.has(contact._id);
            return (
              <div
                key={contact._id}
                className="flex items-center justify-between gap-3 px-2 py-2 hover:bg-teal-50"
                style={{ borderRadius: 8 }}
              >
                <div>
                  <p className="text-sm font-semibold text-stone-950">{contact.name}</p>
                  <p className="text-xs text-stone-500">{contact.email}</p>
                </div>
                <button
                  disabled={busyId === contact._id}
                  onClick={() => (isMember ? removeMember(contact._id) : addMember(contact._id))}
                  className={`px-2.5 py-1 text-xs font-semibold disabled:opacity-50 ${
                    isMember ? "bg-stone-100 text-stone-600" : "bg-teal-700 text-white hover:bg-teal-800"
                  }`}
                  style={{ borderRadius: 8 }}
                >
                  {isMember ? "Remove" : "Add"}
                </button>
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}
