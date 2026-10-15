import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { MetricChip, Pill, SmartImg, cx } from '../components/ui';

export default function CaseStudy() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setData(null);
    setError(null);
    api
      .get(`/projects/${slug}`)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [slug]);

  if (error) {
    return (
      <div className="shell flex min-h-[50vh] flex-col items-center justify-center gap-space-md py-space-2xl text-center">
        <span className="material-symbols-outlined text-[40px] text-outline">search_off</span>
        <h1 className="font-serif text-headline-lg text-on-surface">Case study not found</h1>
        <p className="text-body-sm text-on-surface-variant">{error}</p>
        <Link to="/" className="text-label-md font-semibold text-primary hover:underline">
          ← Back to selected work
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="shell flex min-h-[50vh] items-center justify-center py-space-2xl">
        <span className="font-mono text-code-xs uppercase tracking-widest text-outline">Loading plate…</span>
      </div>
    );
  }

  const { project, siblings } = data;
  const next = siblings[0];

  return (
    <article className="shell flex flex-col gap-space-lg py-space-lg">
      <Link to="/" className="flex min-h-[44px] items-center gap-1 font-mono text-code-xs text-on-surface-variant hover:text-primary">
        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
        <span className="uppercase tracking-wider">Index of Works</span>
      </Link>

      <header className="flex flex-col gap-space-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-code-xs font-semibold uppercase tracking-wider text-primary">{project.category}</span>
          <MetricChip tone={project.badgeTone}>{project.badgeLabel}</MetricChip>
        </div>
        <h1 className="font-serif text-display-hero text-on-surface">{project.title}</h1>
        <p className="max-w-3xl text-body-lg text-on-surface-variant">{project.synopsis}</p>
      </header>

      <div className="overflow-hidden rounded-xl border border-outline-variant/50 bg-surface-container-highest shadow-card">
        <SmartImg
          src={project.heroImage}
          alt={project.heroAlt || project.title}
          className="h-64 w-full object-cover md:h-96"
          monogram={project.title.slice(0, 2).toUpperCase()}
        />
      </div>

      <div className="grid gap-space-xl lg:grid-cols-[1fr_260px]">
        {/* Center editorial track */}
        <div className="flex flex-col gap-space-md">
          {project.metrics.length > 0 && (
            <div className="grid grid-cols-2 gap-space-sm rounded-xl bg-surface-container-low p-space-md">
              {project.metrics.map((m, i) => (
                <div key={i} className="flex flex-col gap-0.5">
                  <span className="font-serif text-headline-sm font-semibold text-primary">{m.value}</span>
                  <span className="font-mono text-code-xs uppercase tracking-wider text-on-surface-variant">{m.label}</span>
                </div>
              ))}
            </div>
          )}
          {(project.description || '').split('\n\n').map((para, i) => (
            <p key={i} className="max-w-3xl text-body-md leading-relaxed text-on-surface-variant">
              {para}
            </p>
          ))}
        </div>

        {/* Analytical side rail */}
        <aside className="flex flex-col gap-space-sm lg:sticky lg:top-20 lg:self-start">
          <div className="flex flex-col gap-3 rounded-xl border border-outline-variant/50 bg-surface-container-low p-space-md shadow-card">
            {[
              ['Client', project.client || '—'],
              ['Year', project.year || '—'],
              ['Engagement', project.client || '—'],
              ['Published', project.publishedAt ? new Date(project.publishedAt).toLocaleDateString() : 'Draft'],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-col gap-0.5">
                <span className="font-mono text-[10px] uppercase tracking-wider text-outline">{k}</span>
                <span className="text-body-sm font-medium text-on-surface">{v}</span>
              </div>
            ))}
            <div className="flex flex-wrap gap-1.5 border-t border-outline-variant/60 pt-3">
              {project.tags.map((t) => (
                <Pill key={t}>{t}</Pill>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {next && (
        <Link
          to={`/work/${next.slug}`}
          className={cx(
            'group flex items-center justify-between gap-space-md rounded-xl border border-outline-variant/50 bg-surface-container-lowest p-space-md shadow-card transition-all hover:border-on-surface/30 hover:shadow-card-hover'
          )}
        >
          <div className="flex min-w-0 flex-col">
            <span className="font-mono text-[10px] uppercase tracking-wider text-outline">Next Case Study</span>
            <span className="truncate font-serif text-headline-sm text-on-surface">{next.title}</span>
          </div>
          <span className="material-symbols-outlined shrink-0 text-[20px] text-primary transition-transform group-hover:translate-x-1">
            arrow_forward
          </span>
        </Link>
      )}
    </article>
  );
}
