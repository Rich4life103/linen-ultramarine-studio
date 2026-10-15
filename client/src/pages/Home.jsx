import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, assetUrl } from '../lib/api';
import ProjectCard from '../components/ProjectCard';
import { Pill, SectionHeading, SmartImg, cx } from '../components/ui';

export default function Home() {
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [skillGroups, setSkillGroups] = useState([]);
  const [experience, setExperience] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    Promise.all([
      api.get('/profile'),
      api.get('/projects'),
      api.get('/skills'),
      api.get('/experience'),
      api.get('/testimonials'),
    ])
      .then(([p, pr, sk, ex, te]) => {
        setProfile(p);
        setProjects(pr);
        setSkillGroups(sk);
        setExperience(ex);
        setTestimonials(te);
        setActiveTab(0);
      })
      .catch((err) => console.error(err));
  }, []);

  const years = projects.length
    ? `${Math.min(...projects.map((p) => Number(p.year) || new Date().getFullYear()))}—${Math.max(
        ...projects.map((p) => Number(p.year) || new Date().getFullYear())
      )}`
    : '';

  return (
    <div className="flex flex-col">
      {/* Top tonal gradient strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-primary via-surface-tint to-secondary-container opacity-90" />

      {/* ── Editorial Hero ─────────────────────────────────────────────── */}
      <section className="shell flex flex-col gap-space-md pb-space-lg pt-space-md">
        <div className="flex items-center gap-space-xs">
          <span className="inline-flex items-center gap-2 rounded-full bg-surface-container-high px-3 py-1 font-mono text-code-xs tracking-wide text-on-surface">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
            </span>
            {profile?.availability || 'Available for Select Projects'}
          </span>
        </div>

        <div className="grid items-center gap-space-xl lg:grid-cols-5">
          <div className="flex flex-col gap-space-md lg:col-span-3">
            <div className="flex flex-col gap-space-xs">
              <h1 className="font-serif text-display-hero text-on-surface">{profile?.headline}</h1>
              <p className="max-w-2xl pt-1 text-body-md leading-relaxed text-on-surface-variant">{profile?.summary}</p>
            </div>

            {/* Dual actions */}
            <div className="flex max-w-md flex-col gap-2.5 pt-1">
              <a
                href="#featured-work"
                className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-primary px-space-md py-3 font-sans text-label-md font-semibold text-on-primary shadow-sm transition-all hover:bg-primary-container active:scale-[0.99]"
              >
                <span>Explore Selected Work</span>
                <span className="material-symbols-outlined text-[18px]">south</span>
              </a>
              <a
                href={assetUrl(profile?.resumeUrl) || '#'}
                className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-surface-container px-space-md py-3 font-sans text-label-md font-semibold text-on-surface shadow-sm transition-all hover:bg-surface-container-high active:scale-[0.99]"
              >
                <span className="material-symbols-outlined text-[18px] text-primary">description</span>
                <span>Download CV / Résumé</span>
              </a>
            </div>
          </div>

          {/* Portrait card */}
          <div className="flex flex-col overflow-hidden rounded-xl bg-surface-container shadow-card lg:col-span-2">
            <div className="relative aspect-square w-full overflow-hidden bg-surface-container-high">
              <SmartImg
                src={profile?.avatarUrl}
                alt={`${profile?.name} — portrait`}
                className="h-full w-full scale-[1.01] object-cover contrast-105 grayscale-[15%] transition-all duration-700 hover:scale-[1.02]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                <span className="rounded-lg bg-black/30 px-2 py-1 font-mono text-code-xs uppercase tracking-wider backdrop-blur-md">
                  Studio Archival Plate No. 04
                </span>
                <span className="rounded-lg bg-black/30 px-2 py-1 font-mono text-code-xs backdrop-blur-md">
                  {new Date().getFullYear()} Index
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 bg-surface-container-low p-3 font-mono text-code-xs text-on-surface-variant">
              <div className="flex min-w-0 items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                <span className="truncate font-medium text-on-surface">
                  {profile?.name} — {profile?.location}
                </span>
              </div>
              <span className="shrink-0 text-[10px] uppercase tracking-wider text-outline">{profile?.timezone}</span>
            </div>
          </div>
        </div>

        {/* Vital statistics rail */}
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-surface-container-low p-3">
          {(profile?.stats || []).map((s) => (
            <div
              key={s.label}
              className={cx(
                'flex flex-col items-center gap-0.5 p-2 text-center',
                s.tone === 'primary' && 'rounded-lg bg-surface-container-lowest shadow-sm'
              )}
            >
              <span
                className={cx(
                  'font-mono text-[10px] uppercase tracking-wider',
                  s.tone === 'primary' ? 'text-primary' : 'text-outline'
                )}
              >
                {s.label}
              </span>
              <span
                className={cx(
                  'font-serif text-headline-sm font-semibold',
                  s.tone === 'primary' ? 'text-primary' : 'text-on-surface'
                )}
              >
                {s.value}
              </span>
              <span className="font-mono text-[10px] text-on-surface-variant">{s.caption}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Selected Work ──────────────────────────────────────────────── */}
      <section id="featured-work" className="shell flex flex-col gap-space-md bg-surface-container-low py-space-md">
        <SectionHeading index="01 / Index of Works" title="Selected Case Studies" meta={years} />
        <div className="flex flex-col gap-space-md">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
        <div className="flex justify-center pt-2">
          <span className="flex min-h-[48px] items-center gap-2 rounded-xl bg-surface-container px-space-md py-3 font-sans text-label-md font-semibold text-on-surface transition-all hover:bg-surface-container-high">
            <span>View all {projects.length} projects in archival catalog</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </span>
        </div>
      </section>

      {/* ── Methodology ────────────────────────────────────────────────── */}
      <section className="shell flex flex-col gap-space-md py-space-lg">
        <SectionHeading
          index="02 / Methodology"
          title="Core Disciplines & Tooling"
          sub="A balanced practice combining typographic precision, algorithmic systems thinking, and production-grade software craftsmanship."
        />
        {/* Segmented tabs */}
        <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-xl bg-surface-container p-1">
          {skillGroups.map((g, i) => (
            <button
              key={g.key}
              onClick={() => setActiveTab(i)}
              className={cx(
                'flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-center font-sans text-label-sm transition-all',
                i === activeTab
                  ? 'bg-surface-container-lowest font-semibold text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              )}
            >
              {g.name}
            </button>
          ))}
        </div>
        {skillGroups.map((g, i) =>
          i === activeTab ? (
            <div key={g.key} className="flex flex-col gap-space-sm">
              <div className="flex flex-col gap-3 rounded-xl bg-surface-container-low p-space-md">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-serif text-headline-sm text-on-surface">{g.name}</span>
                  <span
                    className={cx(
                      'rounded-full px-2 py-0.5 font-mono text-code-xs font-semibold',
                      g.badgeTone === 'secondary' ? 'bg-secondary-fixed text-secondary' : 'bg-primary-fixed text-primary'
                    )}
                  >
                    {g.badgeLabel}
                  </span>
                </div>
                <p className="text-body-sm text-on-surface-variant">{g.description}</p>
                <div className="flex flex-col gap-2 pt-1">
                  {g.skills.map((s) => (
                    <div key={s.id} className="flex items-center justify-between gap-2 rounded-lg bg-surface-container-lowest p-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className={cx('material-symbols-outlined text-[18px]', g.iconTone === 'secondary' ? 'text-secondary' : 'text-primary')}>
                          {s.icon || 'circle'}
                        </span>
                        <span className="truncate font-sans text-label-sm font-semibold text-on-surface">{s.name}</span>
                      </div>
                      <span
                        className={cx(
                          'shrink-0 rounded px-2 py-0.5 font-mono text-code-xs font-semibold',
                          s.levelTone === 'primary' ? 'bg-primary-fixed text-primary' : 'bg-emerald-50 text-emerald-700'
                        )}
                      >
                        {s.levelLabel}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null
        )}
      </section>

      {/* ── Career Timeline ────────────────────────────────────────────── */}
      <section className="shell flex flex-col gap-space-md bg-surface-container-low py-space-md">
        <SectionHeading index="03 / Trajectory" title="Career Timeline" />
        <div className="flex flex-col gap-space-md">
          {experience.map((e) => (
            <div key={e.id} className="flex flex-col gap-2 rounded-xl bg-surface-container-lowest p-space-md shadow-xs">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col">
                  <span className="font-serif text-headline-sm text-on-surface">{e.role}</span>
                  <span
                    className={cx(
                      'font-sans text-label-md font-semibold',
                      e.companyTone === 'primary' ? 'text-primary' : 'text-on-surface'
                    )}
                  >
                    {e.company}
                  </span>
                </div>
                <span className="whitespace-nowrap rounded-full bg-surface-container px-2 py-1 font-mono text-code-xs text-on-surface-variant">
                  {e.period}
                </span>
              </div>
              <p className="text-body-sm text-on-surface-variant">{e.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Endorsements ───────────────────────────────────────────────── */}
      <section className="shell flex flex-col gap-space-md py-space-lg">
        <SectionHeading index="04 / Peer Reviews" title="Endorsements" />
        <div className="grid gap-space-sm md:grid-cols-2">
          {testimonials.map((t) => (
            <blockquote
              key={t.id}
              className={cx(
                'relative flex flex-col gap-3 overflow-hidden rounded-xl p-space-md',
                t.tone === 'low' ? 'bg-surface-container-low' : 'bg-surface-container-high'
              )}
            >
              <span className="material-symbols-outlined select-none text-[32px] text-primary/30">format_quote</span>
              <p className="font-serif text-[1.125rem] italic leading-snug text-on-surface">“{t.quote}”</p>
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex min-w-0 flex-col">
                  <span className="font-sans text-label-sm font-bold text-on-surface">{t.author}</span>
                  <span className="truncate font-mono text-code-xs text-on-surface-variant">{t.role}</span>
                </div>
                <span
                  className={cx(
                    'shrink-0 rounded px-2 py-1 font-mono text-code-xs font-semibold',
                    t.badgeTone === 'primary' ? 'bg-surface-container-lowest text-primary' : 'bg-surface-container-lowest text-on-surface'
                  )}
                >
                  {t.badgeLabel}
                </span>
              </div>
            </blockquote>
          ))}
        </div>
      </section>

      {/* ── Contact CTA ────────────────────────────────────────────────── */}
      <section className="shell mb-space-lg flex flex-col gap-space-md rounded-xl bg-inverse-surface p-space-md text-inverse-on-surface shadow-editorial">
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-code-xs font-semibold uppercase tracking-widest text-inverse-primary">Initiate Dialogue</span>
          <h3 className="font-serif text-headline-lg text-inverse-on-surface">Have an ambitious product challenge?</h3>
          <p className="leading-relaxed text-surface-variant">
            Currently taking on selective advisory roles, design systems leadership, and complex interface architecture
            projects for late {new Date().getFullYear()}.
          </p>
        </div>
        <div className="flex flex-col gap-2.5">
          <a
            href={`mailto:${profile?.email}`}
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-inverse-primary px-space-md py-3 font-sans text-label-md font-semibold text-on-primary-fixed shadow-sm transition-all hover:bg-primary-fixed active:scale-[0.99]"
          >
            <span className="material-symbols-outlined text-[18px]">mail</span>
            <span>{profile?.email}</span>
          </a>
          <div className="flex items-center gap-2">
            <a
              href={assetUrl(profile?.resumeUrl) || '#'}
              className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-lg bg-surface-container-highest/20 px-3 py-2 font-mono text-code-xs text-inverse-on-surface transition-colors hover:bg-surface-container-highest/30"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Download Résumé</span>
            </a>
            <Link
              to="/contact"
              className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-lg bg-surface-container-highest/20 px-3 py-2 font-mono text-code-xs text-inverse-on-surface transition-colors hover:bg-surface-container-highest/30"
            >
              <span className="material-symbols-outlined text-[16px]">chat_bubble_outline</span>
              <span>Contact Page ↗</span>
            </Link>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-1 font-mono text-[11px] text-outline-variant">
          <span>{profile?.gpg}</span>
          <span>Encrypted Correspondence Welcome</span>
        </div>
      </section>
    </div>
  );
}
