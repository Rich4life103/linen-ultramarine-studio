import { Link } from 'react-router-dom';
import ProjectPreview from './ProjectPreview';
import { MetricChip, Pill, cx } from './ui';

const previewIcons = { sparkline: 'payments', 'token-grid': 'layers' };

export default function ProjectCard({ project }) {
  const categoryTone = /fintech|institutional/i.test(project.category) ? 'secondary' : 'primary';
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-outline-variant/50 bg-surface-container-lowest shadow-card transition-all duration-300 hover:border-on-surface/30 hover:shadow-card-hover">
      <div className="flex flex-col gap-1.5 p-space-md pb-2">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cx(
              'font-mono text-code-xs font-semibold uppercase tracking-wider',
              categoryTone === 'secondary' ? 'text-secondary' : 'text-primary'
            )}
          >
            {project.category}
          </span>
          <MetricChip tone={project.badgeTone} icon={previewIcons[project.previewKind]}>
            {project.badgeLabel}
          </MetricChip>
        </div>
        <h3 className="font-serif text-headline-sm text-on-surface">{project.title}</h3>
        <p className="text-body-sm text-on-surface-variant">{project.synopsis}</p>
      </div>

      <div className="mx-space-md my-1">
        <ProjectPreview project={project} />
      </div>

      <div className="flex flex-col gap-3 p-space-md pt-2">
        <div className="flex flex-wrap gap-1.5">
          {project.tags.map((t) => (
            <Pill key={t}>{t}</Pill>
          ))}
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-outline-variant/40 pt-2">
          <span className="truncate font-mono text-code-xs text-on-surface-variant">
            {project.client ? `Client: ${project.client}` : project.year}
          </span>
          <Link
            to={`/work/${project.slug}`}
            className="flex min-h-[44px] shrink-0 items-center gap-1 font-sans text-label-sm text-primary hover:underline"
          >
            Read Case Study
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
