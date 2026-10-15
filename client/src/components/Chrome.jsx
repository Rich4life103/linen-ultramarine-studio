import { Link, NavLink, useLocation } from 'react-router-dom';
import { cx, SmartImg } from './ui';
import { useAuth } from '../context/AuthContext';

const socials = [
  { label: 'GitHub', href: 'https://github.com' },
  { label: 'Read.cv', href: 'https://read.cv' },
  { label: 'X / Tw', href: 'https://x.com' },
  { label: 'LinkedIn', href: 'https://linkedin.com' },
];

export function SiteHeader({ profile }) {
  const { isAdmin } = useAuth();
  return (
    <header className="fixed top-0 z-50 w-full bg-surface/85 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
      <div className="shell flex h-16 items-center justify-between gap-space-sm">
        <Link to="/" className="flex min-w-0 items-center gap-space-sm">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-inverse-surface font-mono text-code-xs font-semibold text-inverse-on-surface">
            {profile?.name
              ?.split(' ')
              .map((w) => w[0])
              .join('')
              .slice(0, 2) || 'EV'}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate font-serif text-headline-sm tracking-tight text-on-surface">
              {profile?.name || 'Elena Vance'}
            </span>
            <span className="truncate font-mono text-code-xs uppercase tracking-wider text-on-surface-variant">
              {profile?.title || 'Design Technologist'}
            </span>
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-space-xs">
          <nav className="hidden items-center gap-1 md:flex">
            {[
              { to: '/', label: 'Work' },
              { to: '/contact', label: 'Contact' },
              { to: isAdmin ? '/admin' : '/admin/login', label: isAdmin ? 'Studio' : 'Sign In' },
            ].map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  cx(
                    'rounded-lg px-3 py-2 font-sans text-label-md transition-colors',
                    isActive ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <span className="hidden items-center gap-1.5 rounded-full bg-surface-container px-2 py-0.5 font-mono text-code-xs text-on-surface-variant sm:inline-flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-600" />
            <span>Q3 Open</span>
          </span>
          <SmartImg
            src={profile?.avatarUrl}
            alt={`${profile?.name || 'Elena Vance'} — portrait`}
            className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-surface-variant"
            monogram="EV"
          />
        </div>
      </div>
    </header>
  );
}

export function SiteFooter({ profile }) {
  return (
    <footer className="w-full bg-surface-container-low">
      <div className="shell flex flex-col items-center gap-space-md py-space-lg text-center">
        <div className="flex flex-wrap items-center justify-center gap-space-md font-mono text-code-xs text-on-surface-variant">
          {socials.map((s, i) => (
            <span key={s.label} className="flex items-center gap-space-md">
              <a
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-[44px] items-center transition-colors hover:text-primary"
              >
                {s.label}
              </a>
              {i < socials.length - 1 && <span className="text-outline-variant">·</span>}
            </span>
          ))}
        </div>
        <div className="flex w-full max-w-sm items-center justify-between px-space-xs">
          <span className="font-mono text-code-xs text-outline">© {new Date().getFullYear()} {profile?.name || 'Elena Vance'} Studio</span>
          <Link
            to="/admin/login"
            className="flex min-h-[44px] items-center px-space-xs font-mono text-code-xs text-outline transition-colors hover:text-on-surface"
          >
            Site Admin ↗
          </Link>
        </div>
      </div>
    </footer>
  );
}

const navItems = [
  { to: '/', label: 'Work', icon: 'grid_view' },
  { to: '/contact', label: 'Contact', icon: 'mail' },
  { to: '/admin', label: 'Studio', icon: 'dashboard_customize' },
];

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="safe-bottom fixed bottom-0 z-50 w-full bg-surface/90 shadow-[0_-2px_12px_rgba(0,0,0,0.03)] backdrop-blur-xl md:hidden">
      <div className="flex h-16 items-center justify-around px-space-md">
        {navItems.map((item) => {
          const active = item.to === '/' ? pathname === '/' : pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cx(
                'flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 transition-colors',
                active ? 'font-bold text-primary' : 'text-on-surface-variant hover:text-on-surface'
              )}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="font-sans text-label-sm">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
