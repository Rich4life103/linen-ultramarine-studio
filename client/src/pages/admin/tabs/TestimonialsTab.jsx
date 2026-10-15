import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { useAdmin } from '../../../components/AdminShell';
import { TabHeader, TabLoading } from './BioTab';

export default function TestimonialsTab() {
  const { reload, touchSave, flash } = useAdmin();
  const [items, setItems] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/testimonials').then(setItems);
  }, []);

  const set = (i, patch) => {
    setItems((l) => l.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/admin/content/testimonials', { testimonials: items });
      touchSave();
      await reload();
      setDirty(false);
      flash('Endorsements staged.');
    } catch (err) {
      flash(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!items) return <TabLoading label="Loading endorsements…" />;

  return (
    <section className="flex flex-col gap-space-md">
      <TabHeader title="Testimonials" hint={dirty ? 'Unsaved changes' : `${items.length} endorsements`} dirty={dirty} saving={saving} onSave={save} />

      <div className="grid gap-space-sm md:grid-cols-2">
        {items.map((t, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
            <textarea
              rows={4}
              className="input-base resize-none font-serif"
              placeholder="Endorsement quote"
              value={t.quote}
              onChange={(e) => set(i, { quote: e.target.value })}
            />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input className="input-base" placeholder="Author" value={t.author} onChange={(e) => set(i, { author: e.target.value })} />
              <input className="input-base" placeholder="Role & company" value={t.role} onChange={(e) => set(i, { role: e.target.value })} />
              <input className="input-base" placeholder="Badge label" value={t.badgeLabel} onChange={(e) => set(i, { badgeLabel: e.target.value })} />
              <select className="input-base" value={t.tone} onChange={(e) => set(i, { tone: e.target.value })}>
                <option value="high">Elevated card</option>
                <option value="low">Recessed card</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <select className="input-base w-40" value={t.badgeTone} onChange={(e) => set(i, { badgeTone: e.target.value })}>
                <option value="primary">Ultramarine badge</option>
                <option value="neutral">Neutral badge</option>
              </select>
              <button
                type="button"
                onClick={() => {
                  setItems((l) => l.filter((_, idx) => idx !== i));
                  setDirty(true);
                }}
                className="flex h-8 items-center gap-1 rounded-lg bg-error-container px-3 font-mono text-code-xs text-on-error-container hover:bg-error hover:text-on-error"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => {
          setItems((l) => [...l, { quote: '', author: '', role: '', badgeLabel: 'Collaborator', badgeTone: 'neutral', tone: 'low' }]);
          setDirty(true);
        }}
        className="flex h-10 w-fit items-center gap-1.5 rounded-lg bg-surface-container-lowest px-4 font-sans text-label-sm text-primary shadow-sm hover:bg-primary-fixed"
      >
        <span className="material-symbols-outlined text-[18px]">add_circle</span>
        Add endorsement
      </button>
    </section>
  );
}
