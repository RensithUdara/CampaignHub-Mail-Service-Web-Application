"use client";

import { FormEvent, useEffect, useState } from "react";
import { Save, X } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Contact } from "@/lib/types";
import { useToast } from "@/components/ToastProvider";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  contact?: Contact | null;
};

export default function ContactModal({ open, onClose, onSaved, contact }: Props) {
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(contact?.name ?? "");
      setEmail(contact?.email ?? "");
      setPhone(contact?.phone ?? "");
      setTags(contact?.tags?.join(", ") ?? "");
      setNotes(contact?.notes ?? "");
      setError(null);
    }
  }, [open, contact]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      const message = "Name and email are required.";
      setError(message);
      showToast(message, "warning");
      return;
    }
    setSaving(true);
    setError(null);

    const payload = {
      name,
      email,
      phone: phone || undefined,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      notes: notes || undefined,
    };

    try {
      const url = contact ? `/api/contacts/${contact._id}` : "/api/contacts";
      const method = contact ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save contact.");
      }
      onSaved();
      onClose();
      showToast(contact ? "Contact updated." : "Contact added.", "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save contact.";
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
      title={contact ? "Edit Contact" : "Add Contact"}
    >
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
            placeholder="Jane Doe"
          />
        </div>
        <div>
          <label className="field-label">
            Email
          </label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="text-field"
            placeholder="jane@example.com"
          />
        </div>
        <div>
          <label className="field-label">
            Phone <span className="text-stone-400">(optional)</span>
          </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="text-field"
            placeholder="+1 555 000 1111"
          />
        </div>
        <div>
          <label className="field-label">
            Tags <span className="text-stone-400">(comma separated)</span>
          </label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="text-field"
            placeholder="client, vip"
          />
        </div>
        <div>
          <label className="field-label">
            Notes <span className="text-stone-400">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
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
            {contact ? "Save changes" : "Add contact"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
