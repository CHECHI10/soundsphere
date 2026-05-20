export default function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  confirmTone = "primary",
  confirmDisabled = false,
  onCancel,
  onConfirm,
}) {
  if (!isOpen) return null;

  const confirmButtonClass = confirmTone === "danger" ? "btn-secondary border-red-500/30 text-red-200 hover:bg-red-500/10" : "btn-primary";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-lg border border-ink-700 bg-ink-900 p-6 shadow-panel" role="dialog" aria-modal="true">
        <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
        {description ? <p className="mb-4 text-sm text-neutral-400">{description}</p> : null}
        <div className="flex justify-end gap-2">
          <button className="btn-secondary" type="button" onClick={onCancel}>
            Cancel
          </button>
          <button className={confirmButtonClass} type="button" onClick={onConfirm} disabled={confirmDisabled}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
