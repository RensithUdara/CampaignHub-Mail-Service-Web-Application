"use client";

import { FormEvent, useEffect, useState } from "react";
import { Save, X } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Group } from "@/lib/types";
import { useToast } from "@/components/ToastProvider";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  group?: Group | null;
};

export default function GroupModal({ open, onClose, onSaved, group }: Props) {
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(group?.name ?? "");
      setDescription(group?.description ?? "");
      setError(null);
    }
  }, [open, group]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      const message = "Group name is required.";
      setError(message);
      showToast(message, "warning");
      return;
    }
    setSaving(true);
    setError(null);

    try {
      const url = group ? `/api/groups/${group._id}` : "/api/groups";
      const method = group ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: description || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save group.");
      onSaved();
      onClose();
      showToast(group ? "Group updated." : "Group created.", "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save group.";
      setError(message);
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={group ? "Edit Group" : "Create Group"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label">
            Name
          </label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-field"
            placeholder="Marketing Team"
          />
        </div>
        <div>
          <label className="field-label">
            Description <span className="text-stone-400">(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="text-field"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            <Save className="h-4 w-4" />
            {group ? "Save changes" : "Create group"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
