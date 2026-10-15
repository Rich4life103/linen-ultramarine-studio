import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { timeAgo } from '../../../lib/time';
import { Toggle, cx } from '../../../components/ui';
import { useAdmin } from '../../../components/AdminShell';
import { TabLoading } from './BioTab';

export default function MessagesTab() {
  const { reload, flash } = useAdmin();
  const [messages, setMessages] = useState(null);
  const [openId, setOpenId] = useState(null);

  const load = () => api.get('/admin/messages').then(setMessages);

  useEffect(() => {
    load();
  }, []);

  const setRead = async (m, isRead) => {
    await api.patch(`/admin/messages/${m.id}`, { isRead });
    setMessages((l) => l.map((x) => (x.id === m.id ? { ...x, isRead } : x)));
    reload();
  };

  const remove = async (m) => {
    await api.del(`/admin/messages/${m.id}`);
    setMessages((l) => l.filter((x) => x.id !== m.id));
    reload();
    flash('Message removed from the inbox.');
  };

  if (!messages) return <TabLoading label="Loading inbox…" />;

  const unread = messages.filter((m) => !m.isRead).length;

  return (
    <section className="flex flex-col gap-space-md">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="font-serif text-headline-lg text-on-surface">Inbox</h2>
          <span
            className={cx(
              'rounded-full px-2 py-0.5 font-mono text-code-xs',
              unread > 0 ? 'bg-primary-fixed text-primary' : 'bg-surface-container-high text-on-surface-variant'
            )}
          >
            {unread} unread
          </span>
        </div>
        <span className="font-mono text-code-xs text-on-surface-variant">{messages.length} total enquiries</span>
      </div>

      {messages.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-xl bg-surface-container-lowest p-space-lg text-center shadow-sm">
          <span className="material-symbols-outlined text-[32px] text-outline">inbox</span>
          <span className="font-serif text-headline-sm text-on-surface">No enquiries yet</span>
          <span className="text-body-sm text-on-surface-variant">Contact form submissions will land here.</span>
        </div>
      )}

      <div className="flex flex-col gap-space-xs">
        {messages.map((m) => {
          const open = openId === m.id;
          return (
            <article key={m.id} className={cx('flex flex-col gap-2 rounded-xl p-space-md shadow-sm', m.isRead ? 'bg-surface-container-low' : 'bg-surface-container-lowest')}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 flex-col">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-sans text-label-md text-on-surface">{m.name}</span>
                    {!m.isRead && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  </div>
                  <span className="truncate font-mono text-code-xs text-on-surface-variant">
                    {m.email} • {timeAgo(m.createdAt)}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Toggle
                    size="sm"
                    checked={m.isRead}
                    onChange={(v) => setRead(m, v)}
                    label={`Mark ${m.name}'s message as read`}
                  />
                  <button
                    onClick={() => setOpenId(open ? null : m.id)}
                    className="flex h-8 items-center gap-1 rounded-lg bg-surface-container px-2.5 font-sans text-label-sm text-on-surface hover:bg-surface-container-high"
                  >
                    <span className="material-symbols-outlined text-[16px]">{open ? 'expand_less' : 'expand_more'}</span>
                    <span className="hidden sm:inline">{open ? 'Close' : 'Read'}</span>
                  </button>
                </div>
              </div>
              {open && (
                <div className="flex flex-col gap-2 border-t border-outline-variant/50 pt-space-sm">
                  {m.subject && <span className="font-serif text-headline-sm text-on-surface">{m.subject}</span>}
                  <p className="whitespace-pre-wrap text-body-sm text-on-surface-variant">{m.body}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject || 'Your enquiry')}`}
                      className="flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 font-sans text-label-sm text-on-primary shadow-sm hover:bg-primary-container"
                    >
                      <span className="material-symbols-outlined text-[16px]">reply</span>
                      Reply
                    </a>
                    <button
                      onClick={() => remove(m)}
                      className="flex h-9 items-center gap-1.5 rounded-lg bg-error-container px-3 font-sans text-label-sm text-on-error-container hover:bg-error hover:text-on-error"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
