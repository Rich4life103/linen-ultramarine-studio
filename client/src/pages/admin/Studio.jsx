import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../../lib/api';
import { AdminContext, default as AdminLayout, SnapshotHistory } from '../../components/AdminShell';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import ProjectsTab from './tabs/ProjectsTab';
import BioTab from './tabs/BioTab';
import SkillsTab from './tabs/SkillsTab';
import TestimonialsTab from './tabs/TestimonialsTab';
import ResumeTab from './tabs/ResumeTab';
import MessagesTab from './tabs/MessagesTab';
import { cx } from '../../components/ui';

export default function Studio() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState('projects');
  const [stats, setStats] = useState(null);
  const [revisions, setRevisions] = useState([]);
  const [lastSaved, setLastSaved] = useState(new Date().toISOString());
  const [publishing, setPublishing] = useState(false);
  const [toast, setToast] = useState('');
  const [showLog, setShowLog] = useState(false);
  const toastTimer = useRef(null);

  const reload = useCallback(async () => {
    try {
      const [s, r] = await Promise.all([api.get('/admin/stats'), api.get('/admin/revisions')]);
      setStats(s);
      setRevisions(r);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (user) reload();
  }, [user, reload]);

  const flash = (message) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 3200);
  };

  const publishAll = async () => {
    setPublishing(true);
    try {
      const res = await api.post('/admin/publish-all');
      await reload();
      setLastSaved(new Date().toISOString());
      flash(res.published > 0 ? `Published ${res.published} staged change${res.published === 1 ? '' : 's'} to production.` : 'Nothing staged — working tree already live.');
    } catch (err) {
      flash(err.message);
    } finally {
      setPublishing(false);
    }
  };

  const context = useMemo(
    () => ({
      stats,
      revisions,
      reload,
      publishAll,
      publishing,
      lastSaved,
      touchSave: () => setLastSaved(new Date().toISOString()),
      flash,
    }),
    [stats, revisions, reload, publishing, lastSaved]
  );

  if (loading) {
    return (
      <div className="shell flex min-h-[60vh] items-center justify-center">
        <span className="font-mono text-code-xs uppercase tracking-widest text-outline">Opening studio…</span>
      </div>
    );
  }
  if (!user) return <Navigate to="/admin/login" replace />;

  const tabs = {
    projects: <ProjectsTab />,
    bio: <BioTab />,
    skills: <SkillsTab />,
    testimonials: <TestimonialsTab />,
    resume: <ResumeTab />,
    messages: <MessagesTab />,
  };

  return (
    <AdminContext.Provider value={context}>
      <AdminLayout tab={tab} setTab={setTab}>
        {tabs[tab]}
        {tab === 'projects' && <SnapshotHistory items={revisions} onOpenLog={() => setShowLog(true)} />}
      </AdminLayout>

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-[70] w-[min(92vw,26rem)] -translate-x-1/2 rounded-xl bg-inverse-surface px-4 py-3 font-mono text-code-xs text-inverse-on-surface shadow-editorial">
          {toast}
        </div>
      )}

      {showLog && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-on-surface/40 px-space-md backdrop-blur-sm"
          onClick={() => setShowLog(false)}
        >
          <div
            className="flex max-h-[70vh] w-full max-w-lg flex-col gap-space-sm overflow-y-auto rounded-2xl bg-surface-container-lowest p-space-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h4 className="font-serif text-headline-sm text-on-surface">Git Audit Log</h4>
              <button onClick={() => setShowLog(false)} className="material-symbols-outlined text-on-surface-variant hover:text-on-surface">
                close
              </button>
            </div>
            {revisions.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-2 border-b border-outline-variant/50 pb-2">
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-label-sm text-on-surface">{r.label}</span>
                  <span className="truncate font-mono text-code-xs text-on-surface-variant">
                    {r.actor} • SHA #{r.sha}
                  </span>
                </div>
                <span className={cx('shrink-0 font-mono text-code-xs text-on-surface-variant')}>{r.createdAt?.slice(0, 16).replace('T', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminContext.Provider>
  );
}
