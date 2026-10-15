import { useState } from 'react';
import { assetUrl } from '../lib/api';

export const cx = (...parts) => parts.filter(Boolean).join(' ');

export const badgeTones = {
  emerald: 'bg-emerald-50 text-emerald-800',
  primary: 'bg-primary-fixed text-on-primary-fixed',
  secondary: 'bg-secondary-fixed text-on-secondary-container',
  neutral: 'bg-surface-container-high text-on-surface',
};

export const dotTones = {
  emerald: 'bg-emerald-600',
  primary: 'bg-primary',
  secondary: 'bg-secondary-container',
  neutral: 'bg-outline',
};

export const levelTones = {
  emerald: 'text-emerald-700 bg-emerald-50',
  primary: 'text-primary bg-primary-fixed',
  secondary: 'text-secondary bg-secondary-fixed',
};

/** Taxonomy pill — JetBrains Mono chip */
export function Pill({ children, className }) {
  return (
    <span
      className={cx(
        'inline-flex h-6 items-center whitespace-nowrap rounded-full border border-outline-variant/60 bg-surface-container px-2.5 font-mono text-code-xs text-on-surface',
        className
      )}
    >
      {children}
    </span>
  );
}

/** Rounded metric / highlight chip with optional icon and leading dot */
export function MetricChip({ children, tone = 'primary', icon }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold',
        badgeTones[tone] || badgeTones.neutral
      )}
    >
      {icon && <span className="material-symbols-outlined text-[12px]">{icon}</span>}
      {children}
    </span>
  );
}

/** Admin status badge with colored dot — published / draft / unsaved / archived */
export function StatusBadge({ status }) {
  const map = {
    published: {
      cls: 'border border-emerald-600/25 bg-emerald-600/[0.08] text-emerald-700',
      dot: 'bg-emerald-600',
      label: 'Published',
    },
    draft: {
      cls: 'border border-amber-600/25 bg-amber-600/[0.08] text-amber-700',
      dot: 'bg-amber-600',
      label: 'Draft',
    },
    unsaved: {
      cls: 'border border-primary/25 bg-primary/[0.08] text-primary',
      dot: 'bg-primary',
      label: 'Unsaved',
    },
    archived: {
      cls: 'border border-outline-variant/60 bg-surface-container-highest text-on-surface-variant',
      dot: null,
      label: 'Archived',
    },
  };
  const s = map[status] || map.draft;
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 font-mono text-code-xs',
        s.cls
      )}
    >
      {s.dot && <span className={cx('h-1.5 w-1.5 rounded-full', s.dot)} />}
      {s.label}
    </span>
  );
}

/** Image with graceful serif-monogram fallback when the source is unavailable */
export function SmartImg({ src, alt, className, monogram = 'EV' }) {
  const [failed, setFailed] = useState(!src);
  if (failed) {
    return (
      <div
        className={cx('flex items-center justify-center bg-surface-container-high', className)}
        aria-label={alt}
        role="img"
      >
        <span className="font-serif text-4xl text-outline">{monogram}</span>
      </div>
    );
  }
  return <img src={assetUrl(src)} alt={alt} className={className} onError={() => setFailed(true)} loading="lazy" />;
}

/** Toggle switch — role=switch, ultramarine when on */
export function Toggle({ checked, onChange, label, size = 'md' }) {
  const dims = size === 'sm' ? { track: 'h-5 w-8', knob: 'h-4 w-4', on: 'translate-x-3' } : { track: 'h-6 w-10', knob: 'h-5 w-5', on: 'translate-x-4' };
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx(
        'relative shrink-0 rounded-full p-0.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        dims.track,
        checked ? 'bg-primary-container' : 'bg-surface-container-high'
      )}
    >
      <span
        className={cx(
          'block rounded-full bg-on-primary shadow-sm transition-transform',
          dims.knob,
          checked ? dims.on : 'translate-x-0'
        )}
      />
    </button>
  );
}

/** Section heading — mono index label + serif headline */
export function SectionHeading({ index, title, meta, sub }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <span className="font-mono text-code-xs font-semibold uppercase tracking-widest text-primary">{index}</span>
        <h2 className="font-serif text-headline-lg text-on-surface">{title}</h2>
        {sub && <p className="max-w-2xl pt-1 text-body-sm text-on-surface-variant">{sub}</p>}
      </div>
      {meta && <span className="shrink-0 font-mono text-code-xs text-on-surface-variant">{meta}</span>}
    </div>
  );
}
