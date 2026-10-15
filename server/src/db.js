import Database from 'better-sqlite3';
import { dbFile, ensureStorageDirs } from './paths.js';

ensureStorageDirs();

export const db = new Database(dbFile);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      headline TEXT NOT NULL,
      summary TEXT NOT NULL,
      availability TEXT NOT NULL,
      location TEXT NOT NULL,
      timezone TEXT NOT NULL,
      email TEXT NOT NULL,
      gpg TEXT NOT NULL,
      avatar_url TEXT,
      logo_url TEXT,
      stats_json TEXT NOT NULL DEFAULT '[]',
      resume_url TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      client TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT '',
      badge_label TEXT NOT NULL DEFAULT '',
      badge_tone TEXT NOT NULL DEFAULT 'primary',
      synopsis TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      year TEXT NOT NULL DEFAULT '',
      tags_json TEXT NOT NULL DEFAULT '[]',
      metrics_json TEXT NOT NULL DEFAULT '[]',
      hero_image TEXT,
      hero_alt TEXT,
      preview_kind TEXT NOT NULL DEFAULT 'generic',
      status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
      visibility INTEGER NOT NULL DEFAULT 1,
      featured INTEGER NOT NULL DEFAULT 0,
      order_index INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      published_at TEXT
    );

    CREATE TABLE IF NOT EXISTS skill_groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      badge_label TEXT NOT NULL DEFAULT '',
      badge_tone TEXT NOT NULL DEFAULT 'primary',
      icon TEXT,
      icon_tone TEXT NOT NULL DEFAULT 'primary',
      order_index INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL REFERENCES skill_groups(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      level_label TEXT NOT NULL DEFAULT '',
      level_tone TEXT NOT NULL DEFAULT 'emerald',
      icon TEXT,
      order_index INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS experience (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL,
      company TEXT NOT NULL,
      company_tone TEXT NOT NULL DEFAULT 'primary',
      period TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      order_index INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quote TEXT NOT NULL,
      author TEXT NOT NULL,
      role TEXT NOT NULL,
      badge_label TEXT NOT NULL DEFAULT '',
      badge_tone TEXT NOT NULL DEFAULT 'primary',
      tone TEXT NOT NULL DEFAULT 'high',
      order_index INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL DEFAULT '',
      body TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS revisions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL,
      detail TEXT NOT NULL DEFAULT '',
      actor TEXT NOT NULL DEFAULT 'Studio',
      sha TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

/** Parse helper for JSON text columns */
export const parseJson = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

/** Shape a project row for API responses */
export function shapeProject(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    client: row.client,
    category: row.category,
    badgeLabel: row.badge_label,
    badgeTone: row.badge_tone,
    synopsis: row.synopsis,
    description: row.description,
    year: row.year,
    tags: parseJson(row.tags_json, []),
    metrics: parseJson(row.metrics_json, []),
    heroImage: row.hero_image,
    heroAlt: row.hero_alt,
    previewKind: row.preview_kind,
    status: row.status,
    visibility: !!row.visibility,
    featured: !!row.featured,
    orderIndex: row.order_index,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
  };
}

/** Record an entry in the revision / snapshot history log */
export function logRevision(label, detail = '', actor = 'Elena Vance') {
  const sha = Math.random().toString(16).slice(2, 9);
  db.prepare(
    'INSERT INTO revisions (label, detail, actor, sha) VALUES (?, ?, ?, ?)'
  ).run(label, detail, actor, sha);
}
