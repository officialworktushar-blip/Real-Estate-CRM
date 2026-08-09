import { Modal } from "./Modal";
import { Button } from "./Button";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<boolean>;
  title?: string;
  message?: string;
  confirmLabel?: string;
  isDeleting?: boolean;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  message,
  confirmLabel = "Delete",
  isDeleting = false,
}: ConfirmDeleteModalProps) {
  const handleConfirm = async () => {
    const ok = await onConfirm();
    if (ok) onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-sm text-dark-300">
        {message || "Are you sure you want to delete this item? This action cannot be undone."}
      </p>
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="secondary" onClick={onClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleConfirm} disabled={isDeleting}>
          {isDeleting ? "Deleting..." : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
