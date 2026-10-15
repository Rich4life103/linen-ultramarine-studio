import { Router } from 'express';
import { db, parseJson, shapeProject } from '../db.js';

const router = Router();

router.get('/profile', (req, res) => {
  const row = db.prepare('SELECT * FROM profile WHERE id = 1').get();
  if (!row) return res.status(404).json({ error: 'Profile not configured' });
  res.json({
    name: row.name,
    title: row.title,
    headline: row.headline,
    summary: row.summary,
    availability: row.availability,
    location: row.location,
    timezone: row.timezone,
    email: row.email,
    gpg: row.gpg,
    avatarUrl: row.avatar_url,
    logoUrl: row.logo_url,
    stats: parseJson(row.stats_json, []),
    resumeUrl: row.resume_url,
    updatedAt: row.updated_at,
  });
});

router.get('/projects', (req, res) => {
  const rows = db
    .prepare(
      `SELECT * FROM projects
       WHERE status = 'published' AND visibility = 1
       ORDER BY order_index ASC, id ASC`
    )
    .all();
  res.json(rows.map(shapeProject));
});

router.get('/projects/:slug', (req, res) => {
  const row = db
    .prepare(`SELECT * FROM projects WHERE slug = ? AND status = 'published' AND visibility = 1`)
    .get(req.params.slug);
  if (!row) return res.status(404).json({ error: 'Case study not found' });
  const project = shapeProject(row);
  const siblings = db
    .prepare(
      `SELECT * FROM projects WHERE status = 'published' AND visibility = 1 AND slug != ? ORDER BY order_index ASC`
    )
    .all(req.params.slug)
    .map(shapeProject);
  res.json({ project, siblings });
});

router.get('/skills', (req, res) => {
  const groups = db
    .prepare('SELECT * FROM skill_groups ORDER BY order_index ASC, id ASC')
    .all()
    .map((g) => ({
      id: g.id,
      key: g.key,
      name: g.name,
      description: g.description,
      badgeLabel: g.badge_label,
      badgeTone: g.badge_tone,
      icon: g.icon,
      iconTone: g.icon_tone,
      skills: db
        .prepare('SELECT * FROM skills WHERE group_id = ? ORDER BY order_index ASC, id ASC')
        .all(g.id)
        .map((s) => ({
          id: s.id,
          name: s.name,
          levelLabel: s.level_label,
          levelTone: s.level_tone,
          icon: s.icon,
        })),
    }));
  res.json(groups);
});

router.get('/experience', (req, res) => {
  const rows = db.prepare('SELECT * FROM experience ORDER BY order_index ASC, id ASC').all();
  res.json(
    rows.map((r) => ({
      id: r.id,
      role: r.role,
      company: r.company,
      companyTone: r.company_tone,
      period: r.period,
      description: r.description,
    }))
  );
});

router.get('/testimonials', (req, res) => {
  const rows = db.prepare('SELECT * FROM testimonials ORDER BY order_index ASC, id ASC').all();
  res.json(
    rows.map((t) => ({
      id: t.id,
      quote: t.quote,
      author: t.author,
      role: t.role,
      badgeLabel: t.badge_label,
      badgeTone: t.badge_tone,
      tone: t.tone,
    }))
  );
});

router.post('/contact', (req, res) => {
  const { name, email, subject, body } = req.body || {};
  if (!name || !email || !body) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address' });
  }
  const info = db
    .prepare('INSERT INTO messages (name, email, subject, body) VALUES (?, ?, ?, ?)')
    .run(String(name).trim(), String(email).trim(), String(subject || '').trim(), String(body).trim());
  res.status(201).json({ ok: true, id: info.lastInsertRowid });
});

export default router;
