# Linen & Ultramarine — Portfolio + CMS Studio

A full-stack implementation of the **Linen & Ultramarine** design system: an outward-facing
editorial portfolio for a design technologist, paired with an administrative content studio.

```
client/   React + Vite + Tailwind frontend (public portfolio + studio CMS)
server/   Express REST API + SQLite (better-sqlite3) + JWT cookie auth
designs/  Original Stitch design references (DESIGN.md + reference HTML/screens)
docs/     Deployment guide + captured screenshots
```

## Quick start

```bash
npm run setup     # installs root, server, and client dependencies
npm run dev       # runs API (:4000) and web (:5173) together
```

Then open <http://localhost:5173>.

### Seeded studio credentials

| Field    | Value                      |
| -------- | -------------------------- |
| Email    | `elena@elenavance.design`  |
| Password | `studio2024`               |

The database seeds itself on first boot with the sample portfolio content (Kinetix OS,
Aura Finance, Prism Component Architecture, Spatial Audio Experiments, skills matrix,
career timeline, endorsements).

## Scripts

| Command              | Description                                        |
| -------------------- | -------------------------------------------------- |
| `npm run setup`      | Install all dependencies (root + server + client)  |
| `npm run dev`        | Run API and web dev servers concurrently           |
| `npm run dev:server` | API only (`http://localhost:4000`)                 |
| `npm run dev:client` | Web only (`http://localhost:5173`, proxies `/api`) |
| `npm run seed`       | Re-run the seed routine (no-op if already seeded)  |
| `npm run build`      | Production build of the frontend                   |
| `npm start`          | Serve the API **and** the built frontend on :4000  |

## Architecture

### Backend (`server/`)

- **Express 4** REST API under `/api`, static `/uploads` for media.
- **SQLite** via `better-sqlite3` (`server/data/studio.db`), schema created on boot.
- **Auth**: bcrypt password hashing + JWT stored in an httpOnly cookie (`studio_token`).
  All `/api/admin/*` routes require a valid session.
- **Multer** handles hero-media and résumé uploads (images + PDF, 12 MB limit).
- Every mutating action writes a row to `revisions`, powering the studio's
  *Snapshot History* / *Git Audit Log*.

Key endpoints:

| Method | Route                          | Auth | Purpose                              |
| ------ | ------------------------------ | ---- | ------------------------------------ |
| POST   | `/api/auth/login`              | –    | Sign in, sets session cookie          |
| POST   | `/api/auth/logout`             | –    | Clear session                         |
| GET    | `/api/auth/me`                 | ✔    | Current session user                  |
| GET    | `/api/profile`                 | –    | Public profile, stats, résumé URL     |
| GET    | `/api/projects`                | –    | Published + visible case studies      |
| GET    | `/api/projects/:slug`          | –    | Single case study + related works     |
| GET    | `/api/skills`                  | –    | Skill groups with capabilities        |
| GET    | `/api/experience`              | –    | Career timeline                       |
| GET    | `/api/testimonials`            | –    | Endorsements                          |
| POST   | `/api/contact`                 | –    | Store a contact enquiry               |
| GET    | `/api/admin/stats`             | ✔    | Staged count, unread inbox, totals    |
| GET    | `/api/admin/projects`          | ✔    | All projects incl. drafts/archived    |
| POST   | `/api/admin/projects`          | ✔    | Create project                        |
| PUT    | `/api/admin/projects/:id`      | ✔    | Update project                        |
| DELETE | `/api/admin/projects/:id`      | ✔    | Purge project                         |
| POST   | `/api/admin/projects/reorder`  | ✔    | Persist drag-and-drop ordering        |
| POST   | `/api/admin/projects/:id/publish` | ✔ | Publish a single project             |
| POST   | `/api/admin/publish-all`       | ✔    | Publish every staged draft            |
| PUT    | `/api/admin/content/profile`   | ✔    | Bio, intro, stats, résumé reference   |
| PUT    | `/api/admin/content/skills`    | ✔    | Replace skills matrix                 |
| PUT    | `/api/admin/content/experience`| ✔    | Replace career timeline               |
| PUT    | `/api/admin/content/testimonials` | ✔ | Replace endorsements                 |
| GET    | `/api/admin/messages`          | ✔    | Contact inbox                         |
| PATCH  | `/api/admin/messages/:id`      | ✔    | Toggle read state                     |
| GET    | `/api/admin/revisions`         | ✔    | Snapshot history                      |
| POST   | `/api/admin/upload`            | ✔    | Upload hero media / résumé            |

### Frontend (`client/`)

- **React 18 + Vite + React Router**, styled with **Tailwind CSS** using the exact
  Linen & Ultramarine token set (colors, typography scale, spacing, elevation, radii).
- Typefaces: **Newsreader** (editorial headlines), **Plus Jakarta Sans** (UI & narrative),
  **JetBrains Mono** (metadata, chips, code) + Material Symbols for iconography.

Public routes:

| Route          | Page                                                              |
| -------------- | ----------------------------------------------------------------- |
| `/`            | Editorial portfolio home (hero, selected work, methodology, timeline, endorsements, CTA) |
| `/work/:slug`  | Case study detail — offset editorial track + analytical side rail  |
| `/contact`     | Correspondence form (writes to the studio inbox)                   |
| `/admin/login` | Private studio sign-in                                             |
| `/admin`       | Content studio (Projects, Bio & Intro, Skills Matrix, Testimonials, Résumé, Messages) |

Studio features mirror the reference design: production status banner, staged-change
control hub with **Publish All**, a case-study manager with drag reordering and an inline
inspector (metadata, metric anchors, hero media, taxonomy, publication status,
visibility), autosave, a **Purge Case Study** modal, snapshot history, and a sticky
autosave/publish strip.

## Screenshots

Captured from the running app (see `docs/screenshots/`):

| Public | Studio |
| ------ | ------ |
| `home.png` — editorial portfolio | `admin-projects.png` — case study manager + inspector |
| `case-study.png` — case study detail | `admin-bio.png` — bio, hero stats, career timeline |
| `contact.png` — correspondence form | `admin-skills.png` — skills matrix editor |
| `admin-login.png` — private sign-in | `admin-testimonials.png` — endorsements editor |
|  | `admin-resume.png` — résumé document record |
|  | `admin-messages.png` — contact inbox |

## Deployment

The frontend deploys to **Vercel** (static SPA) and the API to **Render** (long-running service
with a writable disk for SQLite + uploads). Both configs ship in the repo
(`client/vercel.json`, `render.yaml`).

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for the full step-by-step.

## Notes

- Case studies created in the studio default to *Draft*; only projects with
  `status = published` **and** public visibility appear on the portfolio.
- The *Download CV* action points at a generated placeholder PDF
  (`server/uploads/elena-vance-resume.pdf`); upload a real résumé from
  **Studio → Résumé PDF**.
- Configure `PORT`, `CORS_ORIGIN`, and `JWT_SECRET` via environment variables in
  production.
