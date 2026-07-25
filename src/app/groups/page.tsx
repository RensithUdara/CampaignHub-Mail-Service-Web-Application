"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Pencil, Plus, Trash2, Users } from "lucide-react";
import Button from "@/components/ui/Button";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Pagination from "@/components/ui/Pagination";
import PageHeader from "@/components/ui/PageHeader";
import GroupModal from "@/components/groups/GroupModal";
import { useToast } from "@/components/ToastProvider";
import { Group } from "@/lib/types";

const PAGE_SIZE = 10;

export default function GroupsPage() {
  const { showToast } = useToast();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Group | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadGroups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/groups", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load groups.");
      setGroups(data.groups);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load groups.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const totalPages = Math.max(1, Math.ceil(groups.length / PAGE_SIZE));
  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);
  const pageGroups = groups.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/groups/${deleteTarget._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete group.");
      showToast("Group deleted.", "success");
      setDeleteTarget(null);
      loadGroups();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete group.", "error");
    } finally {
      setDeleting(false);
    }
  }

  function openCreate() {
    setEditingGroup(null);
    setModalOpen(true);
  }

  return (
    <div>
      <PageHeader
        kicker="Audience segments"
        title="Groups"
        description={`${groups.length} group${groups.length === 1 ? "" : "s"} organizing the people you email most often.`}
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Create Group
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="metric-card border-amber-100 bg-gradient-to-br from-white to-amber-50">
          <p className="text-xs font-black uppercase text-amber-700" style={{ letterSpacing: "0.06em" }}>Segments</p>
          <p className="mt-2 text-2xl font-black text-stone-950">{groups.length}</p>
          <p className="text-sm text-stone-500">active groups</p>
        </div>
        <div className="metric-card border-teal-100 bg-gradient-to-br from-white to-teal-50">
          <p className="text-xs font-black uppercase text-teal-700" style={{ letterSpacing: "0.06em" }}>Members</p>
          <p className="mt-2 text-2xl font-black text-stone-950">
            {groups.reduce((sum, group) => sum + (group.memberCount ?? 0), 0)}
          </p>
          <p className="text-sm text-stone-500">total assignments</p>
        </div>
        <div className="metric-card border-violet-100 bg-gradient-to-br from-white to-violet-50">
          <p className="text-xs font-black uppercase text-violet-700" style={{ letterSpacing: "0.06em" }}>Page</p>
          <p className="mt-2 text-2xl font-black text-stone-950">{pageGroups.length}</p>
          <p className="text-sm text-stone-500">groups visible</p>
        </div>
      </div>

      {loading ? (
        <LoadingState />
      ) : groups.length === 0 ? (
        <EmptyState
          title="No groups yet"
          description="Create a group to organize contacts and send emails to many people at once."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Create Group
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {pageGroups.map((group) => (
            <article
              key={group._id}
              className="surface p-4 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_22px_54px_rgba(49,37,20,0.12)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-teal-100 text-teal-800" style={{ borderRadius: 8 }}>
                    <Users className="h-5 w-5" />
                  </span>
                  <div>
                    <Link href={`/groups/${group._id}`} className="font-semibold text-stone-950 hover:text-teal-800">
                      {group.name}
                    </Link>
                    <p className="mt-1 text-sm leading-6 text-stone-500">
                      {group.description || "No description added."}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 bg-stone-100 px-2 py-1 text-xs font-semibold text-stone-600" style={{ borderRadius: 999 }}>
                  {group.memberCount ?? 0} member{group.memberCount === 1 ? "" : "s"}
                </span>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-semibold">
                <Link href={`/groups/${group._id}`} className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-950">
                  View members
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <button
                  onClick={() => {
                    setEditingGroup(group);
                    setModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1 text-stone-600 hover:text-stone-950"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => setDeleteTarget(group)}
                  className="inline-flex items-center gap-1 text-red-700 hover:text-red-900"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      <GroupModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={loadGroups}
        group={editingGroup}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete group"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Contacts will not be deleted.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
