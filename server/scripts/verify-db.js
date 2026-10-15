/**
 * Build-time smoke test for the native SQLite binding.
 *
 * `better-sqlite3` compiles or downloads a platform binary during install. If a host
 * gates or skips that install script, the failure normally only surfaces at runtime as
 * a cryptic dlopen error. Running this in the build pipeline turns it into an obvious,
 * fail-fast error instead.
 */
import Database from 'better-sqlite3';

const db = new Database(':memory:');
db.exec('CREATE TABLE probe (value INTEGER)');
db.prepare('INSERT INTO probe (value) VALUES (?)').run(42);
const row = db.prepare('SELECT value FROM probe').get();
db.close();

if (row.value !== 42) {
  throw new Error(`Unexpected round-trip result: ${JSON.stringify(row)}`);
}

console.log(`better-sqlite3 native binding OK (${process.version})`);
