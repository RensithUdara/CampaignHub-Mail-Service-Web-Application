"use client";

import { Trash2, X } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
  loading,
}: Props) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="text-sm leading-6 text-stone-600">{message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          <X className="h-4 w-4" />
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>
          <Trash2 className="h-4 w-4" />
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
