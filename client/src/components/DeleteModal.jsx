import { cx } from './ui';

export default function DeleteModal({ open, title, label, detail, onCancel, onConfirm, busy }) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-on-surface/40 px-space-md backdrop-blur-sm"
    >
      <div className="flex w-full max-w-md flex-col gap-space-md rounded-2xl bg-surface-container-lowest p-space-lg shadow-2xl">
        <div className="flex items-start gap-space-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-error-container text-on-error-container">
            <span className="material-symbols-outlined text-[24px]">warning</span>
          </div>
          <div className="flex min-w-0 flex-col">
            <h4 className="font-serif text-headline-sm text-on-surface">{title}</h4>
            <span className="font-mono text-code-xs font-medium text-error">{label}</span>
          </div>
        </div>
        <p className="text-body-sm text-on-surface-variant">{detail}</p>
        <div className="flex items-center gap-2 rounded-lg bg-surface-container p-3">
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">info</span>
          <span className="font-mono text-code-xs text-on-surface-variant">
            This operation cannot be reversed. A local fallback snapshot will be downloaded.
          </span>
        </div>
        <div className="flex items-center justify-end gap-2 pt-space-xs">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 rounded-lg bg-surface-container px-4 font-sans text-label-md text-on-surface transition-colors hover:bg-surface-container-high"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={cx(
              'flex h-10 items-center gap-1.5 rounded-lg bg-error px-4 font-sans text-label-md text-on-error shadow-sm transition-colors hover:bg-red-700 disabled:opacity-60'
            )}
          >
            <span className="material-symbols-outlined text-[18px]">delete_forever</span>
            <span>{busy ? 'Purging…' : 'Confirm Deletion'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
