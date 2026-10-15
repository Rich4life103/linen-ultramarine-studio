import { createContext, useContext } from 'react';
import { api } from '../lib/api';
import { timeAgo } from '../lib/time';
import { cx } from './ui';

export const AdminContext = createContext(null);
export const useAdmin = () => useContext(AdminContext);

const sections = [
  { key: 'projects', label: 'Projects', icon: 'folder_special' },
  { key: 'bio', label: 'Bio & Intro', icon: 'person' },
  { key: 'skills', label: 'Skills Matrix', icon: 'hub' },
  { key: 'testimonials', label: 'Testimonials', icon: 'format_quote' },
  { key: 'resume', label: 'Résumé PDF', icon: 'description' },
  { key: 'messages', label: 'Messages', icon: 'inbox' },
];

/** Snapshot history timeline — revision audit log */
export function SnapshotHistory({ items, onOpenLog }) {
  return (
    <section className="flex flex-col gap-space-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-headline-sm text-on-surface">Snapshot History</h3>
        <button onClick={onOpenLog} className="font-mono text-code-xs text-primary hover:underline">
          View Git Audit Log ↗
        </button>
      </div>
      <div className="flex flex-col gap-3 rounded-xl bg-surface-container-low p-space-md shadow-sm">
        {items.length === 0 && <span className="font-mono text-code-xs text-on-surface-variant">No snapshots recorded yet.</span>}
        {items.slice(0, 6).map((r, i) => (
          <div key={r.id} className="flex items-start gap-3">
            <span className={cx('mt-1.5 h-2 w-2 shrink-0 rounded-full', i === 0 ? 'bg-primary' : 'bg-outline-variant')} />
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-sans text-label-sm text-on-surface">{r.label}</span>
                <span className="shrink-0 font-mono text-code-xs text-on-surface-variant">{timeAgo(r.createdAt)}</span>
              </div>
              <span className="truncate font-mono text-code-xs text-on-surface-variant">{r.detail}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function AdminLayout({ tab, setTab, children }) {
  const { stats, lastSaved, publishAll, publishing, reload } = useAdmin();
  const staged = stats?.staged || 0;

  return (
    <div className="flex w-full flex-col pb-24">
      {/* Production deployment status banner */}
      <section className="shell flex flex-col gap-space-sm pt-space-md">
        <div className="flex items-center justify-between gap-2 rounded-xl bg-surface-container-low px-space-md py-2.5 shadow-sm">
          <div className="flex min-w-0 items-center gap-2">
            <span className="material-symbols-outlined shrink-0 text-[18px] text-primary">verified</span>
            <span className="truncate font-mono text-code-xs text-on-surface-variant">
              Live sync: Today at 09:42 EST — Production v3.8
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-surface-container-high px-2 py-0.5">
            <span className="h-2 w-2 animate-ping rounded-full bg-secondary-container" />
            <span className="font-mono text-code-xs text-on-secondary-container">v3.9 Staged</span>
          </div>
        </div>

        {/* Live control & global publication hub */}
        <div className="flex flex-col gap-space-sm rounded-xl bg-surface-container p-space-md shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-space-sm">
            <span
              className={cx(
                'h-3 w-3 shrink-0 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.6)]',
                staged > 0 ? 'bg-amber-500' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
              )}
            />
            <div className="flex flex-col">
              <span className="font-sans text-label-md text-on-surface">
                {staged > 0 ? `${staged} Unsaved Modification${staged === 1 ? '' : 's'}` : 'All changes published'}
              </span>
              <span className="font-mono text-code-xs text-on-surface-variant">
                {staged > 0 ? 'Staged across case studies & skills' : 'Working tree clean'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-surface-container-lowest px-3.5 font-sans text-label-md text-on-surface shadow-sm transition-all hover:bg-surface-container-high active:scale-95 sm:flex-initial"
            >
              <span className="material-symbols-outlined text-[18px]">visibility</span>
              <span>Preview Live</span>
            </a>
            <button
              onClick={publishAll}
              disabled={publishing}
              className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary-container px-4 font-sans text-label-md text-on-primary shadow-md transition-all hover:bg-primary active:scale-95 disabled:opacity-60 sm:flex-initial"
            >
              <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
              <span>{publishing ? 'Publishing…' : 'Publish All'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Section navigation — pills (mobile) / rail (desktop) */}
      <nav aria-label="Studio Sections" className="no-scrollbar w-full overflow-x-auto py-space-xs">
        <div className="shell flex items-center gap-2">
          {sections.map((s) => (
            <button
              key={s.key}
              onClick={() => setTab(s.key)}
              className={cx(
                'flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 font-sans text-label-sm shadow-sm transition-colors',
                tab === s.key
                  ? 'bg-inverse-surface text-inverse-on-surface'
                  : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
              )}
            >
              <span className="material-symbols-outlined text-[16px]">{s.icon}</span>
              <span>
                {s.label}
                {s.key === 'messages' && stats?.unreadMessages > 0 ? ` (${stats.unreadMessages})` : ''}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Tab content */}
      <div className="shell mt-space-sm flex flex-col gap-space-lg">{children}</div>

      {/* Sticky bottom autosave & deployment strip */}
      <div className="pointer-events-none fixed bottom-16 left-0 right-0 z-40 px-margin pb-2 md:bottom-0">
        <div className="pointer-events-auto mx-auto flex max-w-md items-center justify-between rounded-xl bg-inverse-surface/95 p-2 text-inverse-on-surface shadow-editorial backdrop-blur-md">
          <div className="flex items-center gap-2 pl-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="font-mono text-code-xs text-surface-container-high">Autosaved {timeAgo(lastSaved)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => reload?.()}
              className="h-8 rounded-lg bg-surface-container-highest/20 px-3 font-sans text-label-sm text-surface-bright transition-all hover:bg-surface-container-highest/30"
            >
              Save Draft
            </button>
            <button
              onClick={publishAll}
              disabled={publishing}
              className="flex h-8 items-center gap-1 rounded-lg bg-primary px-3.5 font-sans text-label-sm text-on-primary shadow-md transition-all hover:bg-primary-container active:scale-95 disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[16px]">publish</span>
              <span>Publish ({staged})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
