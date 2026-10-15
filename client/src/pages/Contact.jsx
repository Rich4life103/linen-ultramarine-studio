import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { SectionHeading, cx } from '../components/ui';

export default function Contact() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', subject: '', body: '' });
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  useEffect(() => {
    api.get('/profile').then(setProfile).catch(() => {});
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ state: 'sending', message: '' });
    try {
      await api.post('/contact', form);
      setStatus({ state: 'sent', message: 'Message received — expect a reply within two working days.' });
      setForm({ name: '', email: '', subject: '', body: '' });
    } catch (err) {
      setStatus({ state: 'error', message: err.message });
    }
  };

  return (
    <div className="shell flex flex-col gap-space-lg py-space-lg">
      <SectionHeading
        index="05 / Correspondence"
        title="Initiate Dialogue"
        sub="Tell me about the product challenge, the team, and the constraints. Encrypted correspondence is welcome."
      />

      <div className="grid gap-space-xl lg:grid-cols-[1fr_260px]">
        <form onSubmit={submit} className="flex flex-col gap-space-md rounded-xl border border-outline-variant/50 bg-surface-container-lowest p-space-md shadow-card">
          <div className="grid gap-space-sm sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="label-caps" htmlFor="c-name">Name</label>
              <input id="c-name" required className="input-base" value={form.name} onChange={set('name')} placeholder="Ada Lovelace" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="label-caps" htmlFor="c-email">Email</label>
              <input id="c-email" type="email" required className="input-base" value={form.email} onChange={set('email')} placeholder="ada@analytical.engine" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="label-caps" htmlFor="c-subject">Subject</label>
            <input id="c-subject" className="input-base" value={form.subject} onChange={set('subject')} placeholder="Design systems advisory" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="label-caps" htmlFor="c-body">Message</label>
            <textarea id="c-body" required rows={6} className="input-base resize-none" value={form.body} onChange={set('body')} placeholder="Context, scope, timeline…" />
          </div>
          <div className="flex items-center justify-between gap-space-sm">
            <span
              className={cx(
                'font-mono text-code-xs',
                status.state === 'error' ? 'text-error' : status.state === 'sent' ? 'text-emerald-700' : 'text-on-surface-variant'
              )}
            >
              {status.state === 'sent' ? status.message : status.state === 'error' ? status.message : 'Response window · 48h'}
            </span>
            <button
              type="submit"
              disabled={status.state === 'sending'}
              className="flex min-h-[48px] items-center gap-2 rounded-lg bg-primary px-space-md font-sans text-label-md font-semibold text-on-primary shadow-sm transition-all hover:bg-primary-container active:scale-[0.99] disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              <span>{status.state === 'sending' ? 'Sending…' : 'Send Message'}</span>
            </button>
          </div>
        </form>

        <aside className="flex flex-col gap-space-sm">
          <div className="flex flex-col gap-3 rounded-xl bg-surface-container-low p-space-md">
            <span className="font-mono text-[10px] uppercase tracking-wider text-outline">Direct</span>
            <a href={`mailto:${profile?.email}`} className="text-body-sm font-semibold text-primary hover:underline">
              {profile?.email}
            </a>
            <div className="flex flex-col gap-0.5 border-t border-outline-variant/60 pt-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-outline">Studio</span>
              <span className="text-body-sm text-on-surface">{profile?.location}</span>
              <span className="font-mono text-code-xs text-on-surface-variant">{profile?.timezone}</span>
            </div>
            <div className="flex flex-col gap-0.5 border-t border-outline-variant/60 pt-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-outline">Encryption</span>
              <span className="font-mono text-code-xs text-on-surface-variant">{profile?.gpg}</span>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 self-start rounded-full bg-surface-container-high px-3 py-1 font-mono text-code-xs text-on-surface">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
            </span>
            {profile?.availability}
          </span>
        </aside>
      </div>
    </div>
  );
}
