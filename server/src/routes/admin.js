import { Router } from 'express';
import fs from 'node:fs';
import multer from 'multer';
import { db, parseJson, shapeProject, logRevision } from '../db.js';
import { uploadsDir } from '../paths.js';
import { requireAuth } from '../middleware/auth.js';

fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const safe = file.originalname.toLowerCase().replace(/[^a-z0-9.]+/g, '-');
    cb(null, `${Date.now()}-${safe}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, /^(image\/|application\/pdf)/.test(file.mimetype)),
});

const router = Router();
router.use(requireAuth);

/* ---------------------------------- projects --------------------------------- */

router.get('/projects', (req, res) => {
  const rows = db.prepare('SELECT * FROM projects ORDER BY order_index ASC, id ASC').all();
  res.json(rows.map(shapeProject));
});

const projectFields = {
  slug: 'slug',
  title: 'title',
  client: 'client',
  category: 'category',
  badgeLabel: 'badge_label',
  badgeTone: 'badge_tone',
  synopsis: 'synopsis',
  description: 'description',
  year: 'year',
  heroImage: 'hero_image',
  heroAlt: 'hero_alt',
  previewKind: 'preview_kind',
  status: 'status',
};

function applyProject(body, existing = {}) {
  const merged = { ...existing, ...body };
  const columns = {};
  for (const [key, col] of Object.entries(projectFields)) {
    if (merged[key] !== undefined) columns[col] = merged[key] ?? '';
  }
  if (merged.tags) columns.tags_json = JSON.stringify(merged.tags);
  if (merged.metrics) columns.metrics_json = JSON.stringify(merged.metrics);
  if (merged.visibility !== undefined) columns.visibility = merged.visibility ? 1 : 0;
  if (merged.featured !== undefined) columns.featured = merged.featured ? 1 : 0;
  columns.updated_at = new Date().toISOString();
  if (merged.status === 'published' && existing.status !== 'published') {
    columns.published_at = new Date().toISOString();
  }
  return columns;
}

router.post('/projects', (req, res) => {
  const body = req.body || {};
  const title = (body.title || '').trim();
  if (!title) return res.status(400).json({ error: 'Project title is required' });
  const slug = (body.slug || title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  try {
    const cols = applyProject({ ...body, slug, status: body.status || 'draft' });
    const names = Object.keys(cols);
    const info = db
      .prepare(`INSERT INTO projects (${names.join(', ')}) VALUES (${names.map((n) => `@${n}`).join(', ')})`)
      .run(cols);
    logRevision(`Created case study “${title}”`, 'Local Staging Commit • Working Tree');
    const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(shapeProject(row));
  } catch (err) {
    if (String(err.message).includes('UNIQUE')) {
      return res.status(409).json({ error: 'A project with that slug already exists' });
    }
    throw err;
  }
});

router.put('/projects/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Project not found' });
  const cols = applyProject(req.body || {}, row);
  const names = Object.keys(cols).filter((n) => n !== 'id');
  db.prepare(`UPDATE projects SET ${names.map((n) => `${n} = @${n}`).join(', ')} WHERE id = @id`).run({
    ...cols,
    id: row.id,
  });
  logRevision(`Updated ${row.title}`, 'Local Staging Commit • Working Tree');
  res.json(shapeProject(db.prepare('SELECT * FROM projects WHERE id = ?').get(row.id)));
});

router.post('/projects/reorder', (req, res) => {
  const { ids } = req.body || {};
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids array is required' });
  const update = db.prepare('UPDATE projects SET order_index = ? WHERE id = ?');
  ids.forEach((id, index) => update.run(index, id));
  res.json({ ok: true });
});

router.post('/projects/:id/publish', (req, res) => {
  const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Project not found' });
  db.prepare(
    `UPDATE projects SET status = 'published', visibility = 1, published_at = ?, updated_at = ? WHERE id = ?`
  ).run(new Date().toISOString(), new Date().toISOString(), row.id);
  logRevision(`Published ${row.title}`, 'Production Release • Signed by Elena Vance');
  res.json(shapeProject(db.prepare('SELECT * FROM projects WHERE id = ?').get(row.id)));
});

router.delete('/projects/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Project not found' });
  db.prepare('DELETE FROM projects WHERE id = ?').run(row.id);
  logRevision(`Purged case study “${row.title}”`, 'Permanent Production Action');
  res.json({ ok: true, snapshot: shapeProject(row) });
});

/* ----------------------------------- content --------------------------------- */

router.put('/content/profile', (req, res) => {
  const b = req.body || {};
  const current = db.prepare('SELECT * FROM profile WHERE id = 1').get();
  if (!current) return res.status(404).json({ error: 'Profile not configured' });
  const stats = b.stats ? JSON.stringify(b.stats) : current.stats_json;
  db.prepare(
    `UPDATE profile SET name = @name, title = @title, headline = @headline, summary = @summary,
     availability = @availability, location = @location, timezone = @timezone, email = @email,
     gpg = @gpg, avatar_url = @avatarUrl, logo_url = @logoUrl, resume_url = @resumeUrl,
     stats_json = @stats, updated_at = @updatedAt WHERE id = 1`
  ).run({
    name: b.name ?? current.name,
    title: b.title ?? current.title,
    headline: b.headline ?? current.headline,
    summary: b.summary ?? current.summary,
    availability: b.availability ?? current.availability,
    location: b.location ?? current.location,
    timezone: b.timezone ?? current.timezone,
    email: b.email ?? current.email,
    gpg: b.gpg ?? current.gpg,
    avatarUrl: b.avatarUrl ?? current.avatar_url,
    logoUrl: b.logoUrl ?? current.logo_url,
    resumeUrl: b.resumeUrl ?? current.resume_url,
    stats,
    updatedAt: new Date().toISOString(),
  });
  logRevision('Updated Bio & Intro', 'Local Staging Commit • Working Tree');
  res.json({ ok: true });
});

router.put('/content/skills', (req, res) => {
  const groups = req.body?.groups;
  if (!Array.isArray(groups)) return res.status(400).json({ error: 'groups array is required' });
  const replace = db.transaction(() => {
    db.prepare('DELETE FROM skill_groups').run();
    const insertGroup = db.prepare(
      `INSERT INTO skill_groups (key, name, description, badge_label, badge_tone, icon, icon_tone, order_index)
       VALUES (@key, @name, @description, @badgeLabel, @badgeTone, @icon, @iconTone, @orderIndex)`
    );
    const insertSkill = db.prepare(
      'INSERT INTO skills (group_id, name, level_label, level_tone, icon, order_index) VALUES (?, ?, ?, ?, ?, ?)'
    );
    groups.forEach((g, gi) => {
      const info = insertGroup.run({
        key: g.key || `group-${gi + 1}`,
        name: g.name || 'Untitled Group',
        description: g.description || '',
        badgeLabel: g.badgeLabel || '',
        badgeTone: g.badgeTone || 'primary',
        icon: g.icon || null,
        iconTone: g.iconTone || 'primary',
        orderIndex: gi,
      });
      (g.skills || []).forEach((s, si) => {
        insertSkill.run(
          info.lastInsertRowid,
          s.name || 'Skill',
          s.levelLabel || '',
          s.levelTone || 'emerald',
          s.icon || null,
          si
        );
      });
    });
  });
  replace();
  logRevision('Updated Skills Matrix', 'Local Staging Commit • Working Tree');
  res.json({ ok: true });
});

router.put('/content/experience', (req, res) => {
  const items = req.body?.experience;
  if (!Array.isArray(items)) return res.status(400).json({ error: 'experience array is required' });
  const replace = db.transaction(() => {
    db.prepare('DELETE FROM experience').run();
    const insert = db.prepare(
      'INSERT INTO experience (role, company, company_tone, period, description, order_index) VALUES (?, ?, ?, ?, ?, ?)'
    );
    items.forEach((e, i) =>
      insert.run(e.role || 'Role', e.company || '', e.companyTone || 'default', e.period || '', e.description || '', i)
    );
  });
  replace();
  logRevision('Updated Career Timeline', 'Local Staging Commit • Working Tree');
  res.json({ ok: true });
});

router.put('/content/testimonials', (req, res) => {
  const items = req.body?.testimonials;
  if (!Array.isArray(items)) return res.status(400).json({ error: 'testimonials array is required' });
  const replace = db.transaction(() => {
    db.prepare('DELETE FROM testimonials').run();
    const insert = db.prepare(
      'INSERT INTO testimonials (quote, author, role, badge_label, badge_tone, tone, order_index) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    items.forEach((t, i) =>
      insert.run(
        t.quote || '',
        t.author || '',
        t.role || '',
        t.badgeLabel || '',
        t.badgeTone || 'primary',
        t.tone || 'high',
        i
      )
    );
  });
  replace();
  logRevision('Updated Endorsements', 'Local Staging Commit • Working Tree');
  res.json({ ok: true });
});

/* ---------------------------------- messages --------------------------------- */

router.get('/messages', (req, res) => {
  const rows = db.prepare('SELECT * FROM messages ORDER BY created_at DESC, id DESC').all();
  res.json(
    rows.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      subject: m.subject,
      body: m.body,
      isRead: !!m.is_read,
      createdAt: m.created_at,
    }))
  );
});

router.patch('/messages/:id', (req, res) => {
  db.prepare('UPDATE messages SET is_read = ? WHERE id = ?').run(req.body?.isRead ? 1 : 0, req.params.id);
  res.json({ ok: true });
});

router.delete('/messages/:id', (req, res) => {
  db.prepare('DELETE FROM messages WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

/* ---------------------------------- system ----------------------------------- */

router.get('/revisions', (req, res) => {
  const rows = db.prepare('SELECT * FROM revisions ORDER BY created_at DESC, id DESC LIMIT 20').all();
  res.json(
    rows.map((r) => ({
      id: r.id,
      label: r.label,
      detail: r.detail,
      actor: r.actor,
      sha: r.sha,
      createdAt: r.created_at,
    }))
  );
});

router.get('/stats', (req, res) => {
  const projects = db.prepare('SELECT status, COUNT(*) AS n FROM projects GROUP BY status').all();
  const counts = Object.fromEntries(projects.map((p) => [p.status, Number(p.n)]));
  const total = db.prepare('SELECT COUNT(*) AS n FROM projects').get().n;
  const staged = counts.draft || 0;
  const unread = db.prepare('SELECT COUNT(*) AS n FROM messages WHERE is_read = 0').get().n;
  const lastPublish = db.prepare('SELECT published_at FROM projects WHERE published_at IS NOT NULL ORDER BY published_at DESC LIMIT 1').get();
  res.json({
    total,
    published: counts.published || 0,
    draft: counts.draft || 0,
    archived: counts.archived || 0,
    staged,
    unreadMessages: unread,
    lastPublish: lastPublish?.published_at || null,
  });
});

router.post('/publish-all', (req, res) => {
  const info = db
    .prepare(`UPDATE projects SET status = 'published', visibility = 1, published_at = ?, updated_at = ? WHERE status = 'draft'`)
    .run(new Date().toISOString(), new Date().toISOString());
  logRevision(`Published Production Release (${info.changes} project${info.changes === 1 ? '' : 's'})`, 'Signed by Elena Vance');
  res.json({ ok: true, published: info.changes });
});

router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image received' });
  res.status(201).json({ url: `/uploads/${req.file.filename}`, size: req.file.size });
});

export default router;
