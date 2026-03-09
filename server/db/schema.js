const Database = require('better-sqlite3')
const path = require('path')
const db = new Database(path.join(__dirname, 'cbs.db'))
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    role TEXT NOT NULL DEFAULT 'subuser',
    active INTEGER NOT NULL DEFAULT 1,
    plan TEXT NOT NULL DEFAULT 'basic',
    plan_expiry TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    contract_no TEXT,
    contractor TEXT,
    contract_value REAL DEFAULT 0,
    start_date TEXT,
    end_date TEXT,
    current_bill INTEGER DEFAULT 1,
    active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS boq_parts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS boq_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    part_id INTEGER NOT NULL REFERENCES boq_parts(id) ON DELETE CASCADE,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    item_no TEXT NOT NULL,
    description TEXT NOT NULL,
    unit TEXT NOT NULL,
    boq_qty REAL NOT NULL DEFAULT 0,
    rate REAL NOT NULL DEFAULT 0,
    billed_qty REAL NOT NULL DEFAULT 0,
    sort_order INTEGER DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS user_item_access (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id INTEGER NOT NULL REFERENCES boq_items(id) ON DELETE CASCADE,
    access_level TEXT NOT NULL DEFAULT 'edit',
    UNIQUE(user_id, item_id)
  );
  CREATE TABLE IF NOT EXISTS bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    bill_no INTEGER NOT NULL,
    bill_type TEXT NOT NULL DEFAULT 'RA',
    status TEXT NOT NULL DEFAULT 'draft',
    bill_date TEXT,
    amount REAL DEFAULT 0,
    created_by INTEGER REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(project_id, bill_no)
  );
  CREATE TABLE IF NOT EXISTS measurements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_id INTEGER NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    item_id INTEGER NOT NULL REFERENCES boq_items(id),
    zone TEXT,
    floor_level TEXT,
    member TEXT,
    no TEXT DEFAULT '1',
    length TEXT DEFAULT '0',
    width TEXT DEFAULT '0',
    depth TEXT DEFAULT '0',
    qty REAL NOT NULL DEFAULT 0,
    is_group INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    entered_by INTEGER REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS material_receipts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    receipt_no TEXT NOT NULL,
    date TEXT NOT NULL,
    material TEXT NOT NULL,
    supplier TEXT,
    qty REAL NOT NULL,
    unit TEXT,
    rate REAL DEFAULT 0,
    status TEXT DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS cement_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    bill_id INTEGER REFERENCES bills(id),
    week_label TEXT NOT NULL,
    item_name TEXT NOT NULL,
    work_qty REAL NOT NULL,
    norm REAL NOT NULL,
    actual_bags INTEGER NOT NULL,
    date TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS advances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    advance_no TEXT NOT NULL,
    date TEXT NOT NULL,
    contractor TEXT NOT NULL,
    material TEXT NOT NULL,
    total_value REAL NOT NULL DEFAULT 0,
    given REAL NOT NULL DEFAULT 0,
    recovered REAL NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`)
console.log('✅ Database schema ready')
module.exports = db
