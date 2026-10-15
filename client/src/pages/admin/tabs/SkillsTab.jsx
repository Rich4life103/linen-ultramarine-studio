import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { cx } from '../../../components/ui';
import { useAdmin } from '../../../components/AdminShell';
import { TabHeader, TabLoading } from './BioTab';

const ICONS = ['token', 'draw', 'accessibility_new', 'code', 'explore', 'groups', 'analytics', 'terminal', 'speed', 'animation', 'hub', 'layers'];
const TONES = ['emerald', 'primary', 'secondary'];

export default function SkillsTab() {
  const { reload, touchSave, flash } = useAdmin();
  const [groups, setGroups] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/skills').then(setGroups);
  }, []);

  const setGroup = (gi, patch) => {
    setGroups((g) => g.map((x, i) => (i === gi ? { ...x, ...patch } : x)));
    setDirty(true);
  };

  const setSkill = (gi, si, patch) => {
    setGroups((g) => g.map((x, i) => (i === gi ? { ...x, skills: x.skills.map((s, j) => (j === si ? { ...s, ...patch } : s)) } : x)));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/admin/content/skills', { groups });
      touchSave();
      await reload();
      setDirty(false);
      flash('Skills matrix staged.');
    } catch (err) {
      flash(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!groups) return <TabLoading label="Loading skills matrix…" />;

  return (
    <section className="flex flex-col gap-space-md">
      <TabHeader title="Skills Matrix" hint={dirty ? 'Unsaved changes' : `${groups.length} discipline groups`} dirty={dirty} saving={saving} onSave={save} />

      <div className="flex flex-col gap-space-md">
        {groups.map((g, gi) => (
          <div key={g.key} className="flex flex-col gap-space-sm rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input className="input-base" placeholder="Group name" value={g.name} onChange={(e) => setGroup(gi, { name: e.target.value })} />
              <input className="input-base" placeholder="Badge label" value={g.badgeLabel} onChange={(e) => setGroup(gi, { badgeLabel: e.target.value })} />
              <textarea
                rows={2}
                className="input-base resize-none sm:col-span-2"
                placeholder="Group description"
                value={g.description}
                onChange={(e) => setGroup(gi, { description: e.target.value })}
              />
              <label className="flex flex-col gap-1">
                <span className="label-caps">Badge tone</span>
                <select className="input-base" value={g.badgeTone} onChange={(e) => setGroup(gi, { badgeTone: e.target.value })}>
                  <option value="primary">Ultramarine</option>
                  <option value="secondary">Terracotta</option>
                  <option value="neutral">Neutral</option>
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="label-caps">Group icon</span>
                <select className="input-base" value={g.icon || 'hub'} onChange={(e) => setGroup(gi, { icon: e.target.value })}>
                  {ICONS.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex flex-col gap-2 border-t border-outline-variant/50 pt-space-sm">
              <div className="flex items-center justify-between">
                <span className="label-caps">Capabilities</span>
                <button
                  type="button"
                  onClick={() => {
                    setGroup(gi, { skills: [...g.skills, { name: '', levelLabel: '', levelTone: 'emerald', icon: 'circle' }] });
                  }}
                  className="font-mono text-code-xs text-primary"
                >
                  + Add Capability
                </button>
              </div>
              {g.skills.map((s, si) => (
                <div key={si} className="grid grid-cols-1 gap-2 rounded-lg bg-surface-container-low p-2 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center">
                  <input className="input-base" placeholder="Capability" value={s.name} onChange={(e) => setSkill(gi, si, { name: e.target.value })} />
                  <select className="input-base sm:w-36" value={s.icon || 'circle'} onChange={(e) => setSkill(gi, si, { icon: e.target.value })}>
                    {ICONS.map((i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </select>
                  <input className="input-base sm:w-28" placeholder="Level" value={s.levelLabel} onChange={(e) => setSkill(gi, si, { levelLabel: e.target.value })} />
                  <div className="flex items-center gap-1">
                    <select className="input-base sm:w-28" value={s.levelTone} onChange={(e) => setSkill(gi, si, { levelTone: e.target.value })}>
                      {TONES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      aria-label="Remove capability"
                      onClick={() => setGroup(gi, { skills: g.skills.filter((_, j) => j !== si) })}
                      className={cx('material-symbols-outlined text-[18px] text-on-surface-variant hover:text-error')}
                    >
                      close
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setGroups((list) => list.filter((_, i) => i !== gi))}
              className="flex h-8 w-fit items-center gap-1 rounded-lg bg-error-container px-3 font-mono text-code-xs text-on-error-container hover:bg-error hover:text-on-error"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
              Remove group
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() =>
          setGroups((list) => [
            ...list,
            {
              key: `group-${list.length + 1}`,
              name: 'New Discipline',
              description: '',
              badgeLabel: 'Emerging',
              badgeTone: 'primary',
              icon: 'hub',
              iconTone: 'primary',
              skills: [],
            },
          ])
        }
        className="flex h-10 w-fit items-center gap-1.5 rounded-lg bg-surface-container-lowest px-4 font-sans text-label-sm text-primary shadow-sm hover:bg-primary-fixed"
      >
        <span className="material-symbols-outlined text-[18px]">add_circle</span>
        Add discipline group
      </button>
    </section>
  );
}
