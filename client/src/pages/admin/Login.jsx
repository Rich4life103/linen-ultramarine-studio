import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cx } from '../../components/ui';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="shell flex min-h-[70vh] flex-col items-center justify-center py-space-2xl">
      <div className="w-full max-w-sm rounded-xl border border-outline-variant/50 bg-surface-container-lowest p-space-lg shadow-editorial">
        <div className="flex flex-col gap-1 pb-space-md">
          <span className="font-mono text-code-xs font-semibold uppercase tracking-widest text-primary">Private Access</span>
          <h1 className="font-serif text-headline-lg text-on-surface">Studio Sign-In</h1>
          <p className="text-body-sm text-on-surface-variant">Content management for the Vance portfolio estate.</p>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-space-md">
          <div className="flex flex-col gap-1">
            <label className="label-caps" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              className="input-base"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="elena@elenavance.design"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="label-caps" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              className="input-base"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
            />
          </div>
          {error && (
            <p className="rounded-lg bg-error-container px-3 py-2 font-mono text-code-xs text-on-error-container">{error}</p>
          )}
          <button
            type="submit"
            disabled={busy}
            className={cx(
              'flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-primary px-space-md font-sans text-label-md font-semibold text-on-primary shadow-sm transition-all hover:bg-primary-container active:scale-[0.99] disabled:opacity-60'
            )}
          >
            <span className="material-symbols-outlined text-[18px]">lock</span>
            <span>{busy ? 'Verifying…' : 'Enter Studio'}</span>
          </button>
        </form>
        <p className="border-t border-outline-variant/60 pt-space-md font-mono text-code-xs text-on-surface-variant">
          Seeded credentials — elena@elenavance.design / studio2024
        </p>
      </div>
    </div>
  );
}
