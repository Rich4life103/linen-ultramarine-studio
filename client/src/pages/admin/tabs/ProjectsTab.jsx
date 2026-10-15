import { useEffect, useRef, useState } from 'react';
import { api } from '../../../lib/api';
import { timeAgo } from '../../../lib/time';
import { MetricChip, SmartImg, StatusBadge, Toggle, cx } from '../../../components/ui';
import DeleteModal from '../../../components/DeleteModal';
import { useAdmin } from '../../../components/AdminShell';

function Field({ label, children, className }) {
  return (
    <div className={cx('flex flex-col gap-1', className)}>
      <span className="label-caps">{label}</span>
      {children}
    </div>
  );
}

export default function ProjectsTab() {
  const { reload, touchSave, flash } = useAdmin();
  const [projects, setProjects] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [expanded, setExpanded] = useState(null);
  const [savingIds, setSavingIds] = useState({});
  const [dragId, setDragId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const timers = useRef({});

  useEffect(() => {
    api.get('/admin/projects').then((rows) => {
      setProjects(rows);
      setDrafts(Object.fromEntries(rows.map((r) => [r.id, { ...r, tagsText: r.tags.join(', ') }])));
      setExpanded(rows.find((r) => r.status === 'published')?.id ?? rows[0]?.id ?? null);
    });
  }, []);

  useEffect(() => () => Object.values(timers.current).forEach(clearTimeout), []);

  const commit = async (id, draft) => {
    setSavingIds((s) => ({ ...s, [id]: true }));
    try {
      const payload = {
        title: draft.title,
        client: draft.client,
        category: draft.category,
        badgeLabel: draft.badgeLabel,
        badgeTone: draft.badgeTone,
        synopsis: draft.synopsis,
        description: draft.description,
        year: draft.year,
        heroImage: draft.heroImage,
        previewKind: draft.previewKind,
        status: draft.status,
        visibility: draft.visibility,
        tags: draft.tagsText
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        metrics: draft.metrics,
      };
      const saved = await api.put(`/admin/projects/${id}`, payload);
      setProjects((list) => list.map((p) => (p.id === id ? saved : p)));
      touchSave();
      reload();
    } catch (err) {
      flash(err.message);
    } finally {
      setSavingIds((s) => ({ ...s, [id]: false }));
    }
  };

  const update = (id, patch) => {
    setDrafts((d) => {
      const next = { ...d[id], ...patch };
      clearTimeout(timers.current[id]);
      timers.current[id] = setTimeout(() => commit(id, next), 700);
      return { ...d, [id]: next };
    });
  };

  /** Immediate (non-debounced) commit for toggles/selects */
  const updateNow = (id, patch) => {
    clearTimeout(timers.current[id]);
    setDrafts((d) => {
      const next = { ...d[id], ...patch };
      commit(id, next);
      return { ...d, [id]: next };
    });
  };

  const addProject = async () => {
    try {
      const created = await api.post('/admin/projects', {
        title: 'Untitled Case Study',
        category: 'New Work',
        badgeLabel: 'Draft in progress',
        badgeTone: 'neutral',
        year: String(new Date().getFullYear()),
        synopsis: 'One-line editorial synopsis of the engagement.',
        description: '',
        tags: ['New'],
        metrics: [],
        previewKind: 'generic',
        status: 'draft',
        visibility: false,
      });
      setProjects((list) => [...list, created]);
      setDrafts((d) => ({ ...d, [created.id]: { ...created, tagsText: created.tags.join(', ') } }));
      setExpanded(created.id);
      flash('New case study created as draft.');
      reload();
    } catch (err) {
      flash(err.message);
    }
  };

  const removeProject = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.del(`/admin/projects/${deleteTarget.id}`);
      setProjects((list) => list.filter((p) => p.id !== deleteTarget.id));
      flash(`“${deleteTarget.title}” purged. Fallback snapshot saved locally.`);
      setDeleteTarget(null);
      reload();
    } catch (err) {
      flash(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const onDrop = async (targetId) => {
    if (!dragId || dragId === targetId) return;
    const list = [...projects];
    const from = list.findIndex((p) => p.id === dragId);
    const to = list.findIndex((p) => p.id === targetId);
    const [moved] = list.splice(from, 1);
    list.splice(to, 0, moved);
    setProjects(list);
    setDragId(null);
    await api.post('/admin/projects/reorder', { ids: list.map((p) => p.id) });
    touchSave();
  };

  const uploadMedia = async (id, file) => {
    if (!file) return;
    try {
      const { url } = await api.upload('/admin/upload', file);
      updateNow(id, { heroImage: url });
      flash('Hero specimen replaced.');
    } catch (err) {
      flash(err.message);
    }
  };

  return (
    <section className="flex flex-col gap-space-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="font-serif text-headline-lg text-on-surface">Manage Case Studies</h2>
          <span className="rounded-full bg-surface-container-high px-2 py-0.5 font-mono text-code-xs text-on-surface-variant">
            {projects.length} total
          </span>
        </div>
        <button
          onClick={addProject}
          className="flex h-9 items-center gap-1 rounded-lg bg-surface-container-lowest px-3.5 font-sans text-label-sm text-primary shadow-sm transition-all hover:bg-primary-fixed active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>New Project</span>
        </button>
      </div>

      <div className="mt-1 flex flex-col gap-space-xs">
        {projects.map((p) => {
          const draft = drafts[p.id] || p;
          const isOpen = expanded === p.id;
          return (
            <article
              key={p.id}
              draggable
              onDragStart={() => setDragId(p.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(p.id)}
              className={cx(
                'flex flex-col gap-space-sm rounded-xl bg-surface-container-lowest p-space-md shadow-sm transition-all',
                dragId === p.id && 'opacity-50'
              )}
            >
              {/* Row header */}
              <div className="flex items-center justify-between gap-space-sm">
                <div className="flex min-w-0 items-center gap-3">
                  <button
                    aria-label={`Reorder ${p.title}`}
                    className="-ml-1 cursor-grab p-1 text-on-surface-variant hover:text-on-surface"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">drag_indicator</span>
                  </button>
                  {!isOpen && (
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-container-high">
                      <SmartImg
                        src={p.heroImage}
                        alt={p.heroAlt || p.title}
                        className="h-full w-full object-cover"
                        monogram={p.title.slice(0, 2).toUpperCase()}
                      />
                    </div>
                  )}
                  <div className="flex min-w-0 flex-col">
                    <div className="flex items-center gap-2">
                      <span
                        className={cx(
                          'truncate font-sans text-label-md text-on-surface',
                          p.status === 'archived' && 'text-on-surface-variant line-through'
                        )}
                      >
                        {p.title}
                      </span>
                      <StatusBadge status={savingIds[p.id] ? 'unsaved' : p.status} />
                    </div>
                    <span className="truncate font-mono text-code-xs text-on-surface-variant">
                      vance.design/{p.slug} • Updated {timeAgo(p.updatedAt)}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {p.status === 'archived' ? (
                    <button
                      aria-label={`Delete ${p.title}`}
                      onClick={() => setDeleteTarget(p)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-error-container text-on-error-container transition-all hover:bg-error hover:text-on-error"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  ) : (
                    <>
                      <Toggle
                        checked={p.visibility}
                        onChange={(v) => updateNow(p.id, { visibility: v })}
                        label={`Toggle public visibility for ${p.title}`}
                      />
                      <button
                        aria-label={isOpen ? 'Collapse editor' : 'Expand editor'}
                        onClick={() => setExpanded(isOpen ? null : p.id)}
                        className={cx(
                          'ml-1 flex h-9 w-9 items-center justify-center rounded-lg',
                          isOpen ? 'bg-surface-container text-primary' : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                        )}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[20px]">{isOpen ? 'expand_less' : 'expand_more'}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Inline quick editor */}
              {isOpen && (
                <div className="mt-space-xs flex flex-col gap-space-md rounded-lg bg-surface-container-low p-space-md">
                  <div className="flex items-center justify-between border-b border-outline-variant/50 pb-space-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-primary">tune</span>
                      <span className="font-sans text-label-sm uppercase tracking-wider text-on-surface">
                        Inspector & Live Formatter
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-code-xs text-on-surface-variant">
                        {savingIds[p.id] ? 'Saving…' : 'Autosaved'}
                      </span>
                      <form className="flex items-center gap-2" onSubmit={(e) => e.preventDefault()}>
                        <label className="label-caps" htmlFor={`vis-${p.id}`}>
                          Live
                        </label>
                      </form>
                      <Toggle
                        size="sm"
                        checked={p.visibility}
                        onChange={(v) => updateNow(p.id, { visibility: v })}
                        label={`Toggle visual staging mirror for ${p.title}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-space-sm sm:grid-cols-2">
                    <Field label="Project Header">
                      <input className="input-base" value={draft.title} onChange={(e) => update(p.id, { title: e.target.value })} />
                    </Field>
                    <Field label="Client & Ecosystem">
                      <input className="input-base" value={draft.client} onChange={(e) => update(p.id, { client: e.target.value })} />
                    </Field>
                    <Field label="Editorial Synopsis" className="sm:col-span-2">
                      <textarea
                        rows={2}
                        className="input-base resize-none"
                        value={draft.synopsis}
                        onChange={(e) => update(p.id, { synopsis: e.target.value })}
                      />
                    </Field>
                    <Field label="Case Study Body" className="sm:col-span-2">
                      <textarea
                        rows={4}
                        className="input-base resize-none"
                        value={draft.description}
                        onChange={(e) => update(p.id, { description: e.target.value })}
                      />
                    </Field>
                    <Field label="Category Label">
                      <input className="input-base" value={draft.category} onChange={(e) => update(p.id, { category: e.target.value })} />
                    </Field>
                    <Field label="Highlight Badge">
                      <input className="input-base" value={draft.badgeLabel} onChange={(e) => update(p.id, { badgeLabel: e.target.value })} />
                    </Field>
                    <Field label="Year">
                      <input className="input-base" value={draft.year} onChange={(e) => update(p.id, { year: e.target.value })} />
                    </Field>
                    <Field label="Taxonomy Tags (comma separated)">
                      <input className="input-base" value={draft.tagsText} onChange={(e) => update(p.id, { tagsText: e.target.value })} />
                    </Field>
                    <Field label="Publication Status">
                      <select className="input-base" value={draft.status} onChange={(e) => updateNow(p.id, { status: e.target.value })}>
                        <option value="draft">Draft — staged</option>
                        <option value="published">Published — live</option>
                        <option value="archived">Archived</option>
                      </select>
                    </Field>
                    <Field label="Preview Renderer">
                      <select className="input-base" value={draft.previewKind} onChange={(e) => updateNow(p.id, { previewKind: e.target.value })}>
                        <option value="spatial-grid">Spatial canvas mock</option>
                        <option value="sparkline">Telemetry sparkline</option>
                        <option value="token-grid">Design token grid</option>
                        <option value="generic">Media plate</option>
                      </select>
                    </Field>
                  </div>

                  {/* Metric anchors */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="label-caps">Key Metric Anchors</span>
                      <button
                        type="button"
                        onClick={() => update(p.id, { metrics: [...draft.metrics, { value: '', label: '' }] })}
                        className="flex items-center gap-1 font-mono text-code-xs text-primary"
                      >
                        + Add Metric
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-space-sm sm:grid-cols-2">
                      {draft.metrics.map((m, i) => (
                        <div key={i} className="flex flex-col gap-1 rounded-lg bg-surface-container-lowest p-2.5 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-code-xs uppercase text-on-surface-variant">
                              Metric {String(i + 1).padStart(2, '0')}
                            </span>
                            <button
                              type="button"
                              aria-label={`Remove metric ${i + 1}`}
                              onClick={() => update(p.id, { metrics: draft.metrics.filter((_, idx) => idx !== i) })}
                              className="material-symbols-outlined text-[16px] text-on-surface-variant hover:text-error"
                            >
                              close
                            </button>
                          </div>
                          <input
                            className="bg-transparent font-sans text-label-md text-primary outline-none"
                            placeholder="+42% Task Speed"
                            value={m.value}
                            onChange={(e) =>
                              update(p.id, {
                                metrics: draft.metrics.map((mm, idx) => (idx === i ? { ...mm, value: e.target.value } : mm)),
                              })
                            }
                          />
                          <input
                            className="bg-transparent font-sans text-body-sm text-on-surface-variant outline-none"
                            placeholder="Dispatch latency reduction"
                            value={m.label}
                            onChange={(e) =>
                              update(p.id, {
                                metrics: draft.metrics.map((mm, idx) => (idx === i ? { ...mm, label: e.target.value } : mm)),
                              })
                            }
                          />
                        </div>
                      ))}
                      {draft.metrics.length === 0 && (
                        <span className="font-mono text-code-xs text-on-surface-variant">No anchors yet — add a quantified outcome.</span>
                      )}
                    </div>
                  </div>

                  {/* Hero media */}
                  <div className="flex flex-col gap-2">
                    <span className="label-caps">Hero Specimen Media</span>
                    <div className="relative overflow-hidden rounded-lg bg-surface-container-highest">
                      <SmartImg
                        src={draft.heroImage}
                        alt={draft.heroAlt || draft.title}
                        className="h-44 w-full object-cover"
                        monogram={draft.title.slice(0, 2).toUpperCase()}
                      />
                      <div className="absolute inset-0 flex items-end justify-between gap-2 bg-gradient-to-t from-on-surface/80 via-transparent to-transparent p-space-sm">
                        <div className="flex min-w-0 items-center gap-1.5 font-mono text-code-xs text-on-primary">
                          <span className="material-symbols-outlined text-[16px]">image</span>
                          <span className="truncate">{draft.heroImage || 'no media attached'}</span>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const input = document.getElementById(`hero-input-${p.id}`);
                              if (input) input.value = '';
                              input?.click();
                            }}
                            className="flex h-8 items-center gap-1 rounded bg-surface-tint px-2.5 font-sans text-label-sm text-on-primary shadow-sm hover:bg-primary"
                          >
                            <span className="material-symbols-outlined text-[16px]">cached</span>
                            <span>Replace</span>
                          </button>
                          <input
                            id={`hero-input-${p.id}`}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => uploadMedia(p.id, e.target.files?.[0])}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant/50 pt-space-xs">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {draft.tagsText
                        .split(',')
                        .map((t) => t.trim())
                        .filter(Boolean)
                        .map((t) => (
                          <MetricChip key={t} tone={draft.badgeTone}>
                            {t}
                          </MetricChip>
                        ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(p)}
                      className="flex h-8 items-center gap-1 rounded-lg bg-error-container px-3 font-mono text-code-xs text-on-error-container transition-all hover:bg-error hover:text-on-error"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                      <span>Purge</span>
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <DeleteModal
        open={!!deleteTarget}
        title="Purge Case Study?"
        label="Permanent Production Action"
        detail={`Are you certain you wish to delete “${deleteTarget?.title}”? This will expunge all associated metrics, public canonical routes, and CDN assets.`}
        busy={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={removeProject}
      />
    </section>
  );
}
