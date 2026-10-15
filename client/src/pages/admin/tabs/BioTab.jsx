import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { Toggle, cx } from '../../../components/ui';
import { useAdmin } from '../../../components/AdminShell';

function Field({ label, children, className }) {
  return (
    <div className={cx('flex flex-col gap-1', className)}>
      <span className="label-caps">{label}</span>
      {children}
    </div>
  );
}

export default function BioTab() {
  const { reload, touchSave, flash } = useAdmin();
  const [profile, setProfile] = useState(null);
  const [experience, setExperience] = useState([]);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/profile'), api.get('/experience')]).then(([p, e]) => {
      setProfile({ ...p, resumeUrl: p.resumeUrl || '' });
      setExperience(e);
    });
  }, []);

  const set = (patch) => {
    setProfile((p) => ({ ...p, ...patch }));
    setDirty(true);
  };

  const setExp = (i, patch) => {
    setExperience((list) => list.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/admin/content/profile', profile);
      await api.put('/admin/content/experience', { experience });
      touchSave();
      await reload();
      setDirty(false);
      flash('Bio, intro & timeline staged. Publish All to push live.');
    } catch (err) {
      flash(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return <TabLoading label="Loading bio…" />;

  return (
    <section className="flex flex-col gap-space-md">
      <TabHeader title="Bio & Intro" hint={dirty ? 'Unsaved changes' : 'All edits staged'} dirty={dirty} saving={saving} onSave={save} />

      <div className="grid grid-cols-1 gap-space-sm rounded-xl bg-surface-container-lowest p-space-md shadow-sm sm:grid-cols-2">
        <Field label="Display Name">
          <input className="input-base" value={profile.name} onChange={(e) => set({ name: e.target.value })} />
        </Field>
        <Field label="Discipline Title">
          <input className="input-base" value={profile.title} onChange={(e) => set({ title: e.target.value })} />
        </Field>
        <Field label="Hero Headline" className="sm:col-span-2">
          <textarea rows={2} className="input-base resize-none" value={profile.headline} onChange={(e) => set({ headline: e.target.value })} />
        </Field>
        <Field label="Narrative Summary" className="sm:col-span-2">
          <textarea rows={4} className="input-base resize-none" value={profile.summary} onChange={(e) => set({ summary: e.target.value })} />
        </Field>
        <Field label="Availability Ribbon">
          <input className="input-base" value={profile.availability} onChange={(e) => set({ availability: e.target.value })} />
        </Field>
        <Field label="Location">
          <input className="input-base" value={profile.location} onChange={(e) => set({ location: e.target.value })} />
        </Field>
        <Field label="Timezone">
          <input className="input-base" value={profile.timezone} onChange={(e) => set({ timezone: e.target.value })} />
        </Field>
        <Field label="Public Email">
          <input className="input-base" value={profile.email} onChange={(e) => set({ email: e.target.value })} />
        </Field>
        <Field label="GPG Fingerprint">
          <input className="input-base" value={profile.gpg} onChange={(e) => set({ gpg: e.target.value })} />
        </Field>
        <Field label="Portrait Image URL">
          <input className="input-base" value={profile.avatarUrl || ''} onChange={(e) => set({ avatarUrl: e.target.value })} placeholder="https:// or /uploads/…" />
        </Field>
      </div>

      {/* Vital statistics */}
      <div className="flex flex-col gap-space-sm rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
        <span className="font-sans text-label-sm uppercase tracking-wider text-on-surface">Hero Vital Statistics</span>
        <div className="grid grid-cols-1 gap-space-sm sm:grid-cols-3">
          {(profile.stats || []).map((s, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-lg bg-surface-container-low p-3">
              <input
                className="input-base"
                placeholder="Label"
                value={s.label}
                onChange={(e) => set({ stats: profile.stats.map((x, idx) => (idx === i ? { ...x, label: e.target.value } : x)) })}
              />
              <input
                className="input-base font-serif"
                placeholder="Value"
                value={s.value}
                onChange={(e) => set({ stats: profile.stats.map((x, idx) => (idx === i ? { ...x, value: e.target.value } : x)) })}
              />
              <input
                className="input-base"
                placeholder="Caption"
                value={s.caption}
                onChange={(e) => set({ stats: profile.stats.map((x, idx) => (idx === i ? { ...x, caption: e.target.value } : x)) })}
              />
              <label className="flex items-center justify-between gap-2">
                <span className="font-mono text-code-xs text-on-surface-variant">Ultramarine emphasis</span>
                <Toggle
                  size="sm"
                  checked={s.tone === 'primary'}
                  onChange={(v) =>
                    set({ stats: profile.stats.map((x, idx) => (idx === i ? { ...x, tone: v ? 'primary' : 'default' } : x)) })
                  }
                  label={`Emphasise ${s.label}`}
                />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Career timeline */}
      <div className="flex flex-col gap-space-sm rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
        <div className="flex items-center justify-between">
          <span className="font-sans text-label-sm uppercase tracking-wider text-on-surface">Career Timeline</span>
          <button
            type="button"
            onClick={() => {
              setExperience((l) => [...l, { role: '', company: '', companyTone: 'default', period: '', description: '' }]);
              setDirty(true);
            }}
            className="font-mono text-code-xs text-primary"
          >
            + Add Role
          </button>
        </div>
        {experience.map((e, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-lg bg-surface-container-low p-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <input className="input-base" placeholder="Role" value={e.role} onChange={(ev) => setExp(i, { role: ev.target.value })} />
              <input className="input-base" placeholder="Company" value={e.company} onChange={(ev) => setExp(i, { company: ev.target.value })} />
              <input className="input-base" placeholder="Period" value={e.period} onChange={(ev) => setExp(i, { period: ev.target.value })} />
            </div>
            <textarea
              rows={2}
              className="input-base resize-none"
              placeholder="Description"
              value={e.description}
              onChange={(ev) => setExp(i, { description: ev.target.value })}
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <span className="font-mono text-code-xs text-on-surface-variant">Company in ultramarine</span>
                <Toggle size="sm" checked={e.companyTone === 'primary'} onChange={(v) => setExp(i, { companyTone: v ? 'primary' : 'default' })} label="Company emphasis" />
              </label>
              <button
                type="button"
                onClick={() => {
                  setExperience((l) => l.filter((_, idx) => idx !== i));
                  setDirty(true);
                }}
                className="material-symbols-outlined text-[18px] text-on-surface-variant hover:text-error"
              >
                delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function TabLoading({ label }) {
  return (
    <div className="flex min-h-[30vh] items-center justify-center">
      <span className="font-mono text-code-xs uppercase tracking-widest text-outline">{label}</span>
    </div>
  );
}

export function TabHeader({ title, hint, dirty, saving, onSave }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <h2 className="font-serif text-headline-lg text-on-surface">{title}</h2>
        <span
          className={cx(
            'rounded-full px-2 py-0.5 font-mono text-code-xs',
            dirty ? 'bg-amber-100 text-amber-800' : 'bg-surface-container-high text-on-surface-variant'
          )}
        >
          {hint}
        </span>
      </div>
      <button
        onClick={onSave}
        disabled={saving}
        className="flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 font-sans text-label-sm text-on-primary shadow-sm transition-all hover:bg-primary-container active:scale-95 disabled:opacity-60"
      >
        <span className="material-symbols-outlined text-[18px]">save</span>
        <span>{saving ? 'Saving…' : 'Save & Stage'}</span>
      </button>
    </div>
  );
}
