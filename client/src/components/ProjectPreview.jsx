import { cx, SmartImg } from './ui';

/** Bespoke miniature interface previews per project — mirrors the design mockups */
export default function ProjectPreview({ project }) {
  const kind = project.previewKind || 'generic';

  if (kind === 'spatial-grid') return <SpatialGrid />;
  if (kind === 'sparkline') return <Sparkline metrics={project.metrics} />;
  if (kind === 'token-grid') return <TokenGrid />;
  return (
    <div className="overflow-hidden rounded-lg bg-surface-container-highest">
      <SmartImg
        src={project.heroImage}
        alt={project.heroAlt || project.title}
        className="h-32 w-full object-cover"
        monogram={project.title.slice(0, 2).toUpperCase()}
      />
    </div>
  );
}

function SpatialGrid() {
  return (
    <div className="flex flex-col gap-2 rounded-lg bg-surface-container-highest p-3">
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-secondary-container" />
          <span className="h-2.5 w-2.5 rounded-full bg-surface-variant" />
          <span className="h-2.5 w-2.5 rounded-full bg-surface-variant" />
        </div>
        <span className="font-mono text-[10px] text-on-surface-variant">viewport.render(spatial_node_7)</span>
      </div>
      <div className="grid h-20 grid-cols-3 gap-1.5">
        <div className="flex flex-col justify-between rounded bg-primary/10 p-1.5">
          <span className="font-mono text-[9px] font-semibold text-primary">NODE A</span>
          <div className="h-1 w-full rounded bg-primary/20" />
          <div className="h-1 w-2/3 rounded bg-primary/20" />
        </div>
        <div className="col-span-2 flex flex-col justify-between rounded bg-surface-container-lowest p-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] font-medium text-on-surface">CANVAS STREAM</span>
            <span className="rounded bg-emerald-100 px-1 font-mono text-[8px] text-emerald-700">60 FPS</span>
          </div>
          <div className="flex h-6 items-end gap-1">
            {[3, 5, 4, 6, 2, 5].map((h, i) => (
              <div key={i} className={cx('w-1/6 rounded-xs', h === 2 ? 'bg-primary-container' : 'bg-primary')} style={{ height: h * 4 }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Sparkline({ metrics = [] }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg bg-surface-container p-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-code-xs font-semibold text-on-surface">Liquidity Curve Optimization</span>
        <span className="font-mono text-[10px] font-bold text-primary">LIVE TELEMETRY</span>
      </div>
      <div className="flex items-baseline justify-between">
        <div>
          <span className="font-mono text-[10px] text-outline">NET CASH POOL</span>
          <p className="font-serif text-headline-sm leading-none text-on-surface">{metrics[0]?.value || '$184.92M'}</p>
        </div>
        <span className="font-mono text-code-xs font-semibold text-emerald-700">{metrics[1]?.label || '+8.4% 24h'}</span>
      </div>
      <div className="h-8 w-full pt-1">
        <svg className="h-full w-full overflow-visible" fill="none" viewBox="0 0 280 40">
          <path
            d="M0 32 L40 26 L80 29 L120 18 L160 22 L200 12 L240 15 L280 4"
            stroke="#0037b0"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
          />
          <path d="M0 32 L40 26 L80 29 L120 18 L160 22 L200 12 L240 15 L280 4 L280 40 L0 40 Z" fill="url(#blue-grad)" opacity="0.15" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="blue-grad" x1="0" x2="0" y1="0" y2="40">
              <stop stopColor="#0037b0" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function TokenGrid() {
  return (
    <div className="flex flex-col gap-2 rounded-lg bg-surface-container-high p-3">
      <div className="flex items-center justify-between font-mono text-[10px] text-on-surface-variant">
        <span>token.palette.semantic</span>
        <span className="text-primary">v3.4.1 [compiled]</span>
      </div>
      <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[9px]">
        <div className="rounded-xs bg-primary py-2 font-semibold text-on-primary">brand.blue</div>
        <div className="rounded-xs bg-secondary py-2 font-semibold text-on-secondary">accent.rust</div>
        <div className="rounded-xs bg-surface-dim py-2 font-semibold text-on-surface">mono.zinc</div>
        <div className="rounded-xs bg-inverse-surface py-2 font-semibold text-inverse-on-surface">dark.ink</div>
      </div>
    </div>
  );
}
