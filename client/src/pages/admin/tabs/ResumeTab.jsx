import { useEffect, useRef, useState } from 'react';
import { api, assetUrl } from '../../../lib/api';
import { useAdmin } from '../../../components/AdminShell';
import { TabHeader, TabLoading } from './BioTab';

export default function ResumeTab() {
  const { reload, touchSave, flash } = useAdmin();
  const [profile, setProfile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    api.get('/profile').then((p) => setProfile({ resumeUrl: p.resumeUrl || '' }));
  }, []);

  const save = async () => {
    setBusy(true);
    try {
      await api.put('/admin/content/profile', { resumeUrl: profile.resumeUrl });
      touchSave();
      await reload();
      setDirty(false);
      flash('Résumé reference updated.');
    } catch (err) {
      flash(err.message);
    } finally {
      setBusy(false);
    }
  };

  const upload = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      const { url, size } = await api.upload('/admin/upload', file);
      setProfile({ resumeUrl: url });
      await api.put('/admin/content/profile', { resumeUrl: url });
      touchSave();
      await reload();
      flash(`Résumé uploaded (${Math.round(size / 1024)} KB).`);
    } catch (err) {
      flash(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!profile) return <TabLoading label="Loading résumé record…" />;

  return (
    <section className="flex flex-col gap-space-md">
      <TabHeader title="Résumé PDF" hint={dirty ? 'Unsaved changes' : 'Signed document record'} dirty={dirty} saving={busy} onSave={save} />

      <div className="flex flex-col gap-space-sm rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
        <span className="label-caps">Current document</span>
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface-container-low p-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary">picture_as_pdf</span>
            <span className="truncate font-mono text-code-xs text-on-surface">
              {profile.resumeUrl || 'No résumé attached'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {profile.resumeUrl && (
              <a
                href={assetUrl(profile.resumeUrl)}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 items-center gap-1.5 rounded-lg bg-surface-container-lowest px-3 font-sans text-label-sm text-on-surface shadow-sm hover:bg-surface-container-high"
              >
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                Open
              </a>
            )}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 font-sans text-label-sm text-on-primary shadow-sm hover:bg-primary-container disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[16px]">upload</span>
              <span>{busy ? 'Uploading…' : 'Upload PDF'}</span>
            </button>
            <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="label-caps">Or reference an external URL</span>
          <input
            className="input-base"
            value={profile.resumeUrl}
            placeholder="/uploads/elena-vance-resume.pdf"
            onChange={(e) => {
              setProfile({ resumeUrl: e.target.value });
              setDirty(true);
            }}
          />
        </div>
        <p className="font-mono text-code-xs text-on-surface-variant">
          The public hero “Download CV / Résumé” action and the inverse-surface callout both resolve to this asset.
        </p>
      </div>
    </section>
  );
}
