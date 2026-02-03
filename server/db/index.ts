import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { CREATE_USERS_TABLE } from './schema';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../../data/rims.db');

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    // Ensure data directory exists
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');

    // Initialize schema
    db.exec(CREATE_USERS_TABLE);
  }
  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

export interface UserRow {
  id: number;
  email: string;
  password: string;
  role: string;
  sign_in_count: number;
  last_sign_in_at: string | null;
  last_sign_in_ip: string | null;
  email_verified: number;
  email_verification_token: string | null;
  email_verification_token_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  email: string;
  password: string;
  role: string;
  signInCount: number;
  lastSignInAt: string | null;
  lastSignInIp: string | null;
  emailVerified: boolean;
  emailVerificationToken: string | null;
  emailVerificationTokenExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    password: row.password,
    role: row.role,
    signInCount: row.sign_in_count,
    lastSignInAt: row.last_sign_in_at,
    lastSignInIp: row.last_sign_in_ip,
    emailVerified: row.email_verified === 1,
    emailVerificationToken: row.email_verification_token,
    emailVerificationTokenExpiresAt: row.email_verification_token_expires_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const userQueries = {
  findByEmail(email: string): User | null {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email) as UserRow | undefined;
    return row ? rowToUser(row) : null;
  },

  findByVerificationToken(token: string): User | null {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM users WHERE email_verification_token = ?').get(token) as UserRow | undefined;
    return row ? rowToUser(row) : null;
  },

  create(data: {
    email: string;
    password: string;
    role?: string;
    emailVerificationToken: string;
    emailVerificationTokenExpiresAt: string;
  }): User {
    const db = getDatabase();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO users (email, password, role, sign_in_count, email_verified, email_verification_token, email_verification_token_expires_at, created_at, updated_at)
      VALUES (?, ?, ?, 0, 0, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.email,
      data.password,
      data.role || 'user',
      data.emailVerificationToken,
      data.emailVerificationTokenExpiresAt,
      now,
      now
    );

    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid) as UserRow;
    return rowToUser(row);
  },

  markEmailVerified(userId: number): User | null {
    const db = getDatabase();
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE users
      SET email_verified = 1, email_verification_token = NULL, email_verification_token_expires_at = NULL, updated_at = ?
      WHERE id = ?
    `).run(now, userId);

    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as UserRow | undefined;
    return row ? rowToUser(row) : null;
  },

  setVerificationToken(userId: number, token: string, expiresAt: string): User | null {
    const db = getDatabase();
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE users
      SET email_verification_token = ?, email_verification_token_expires_at = ?, updated_at = ?
      WHERE id = ?
    `).run(token, expiresAt, now, userId);

    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as UserRow | undefined;
    return row ? rowToUser(row) : null;
  },
};

export const rateLimitQueries = {
  canSendEmail(email: string): boolean {
    const db = getDatabase();
    const row = db.prepare('SELECT last_sent_at FROM email_rate_limits WHERE email = ?').get(email) as { last_sent_at: string } | undefined;

    if (!row) {
      return true;
    }

    const lastSent = new Date(row.last_sent_at);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastSent.getTime()) / (1000 * 60);

    return diffMinutes >= 1; // Allow one email per minute
  },

  recordEmailSent(email: string): void {
    const db = getDatabase();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO email_rate_limits (email, last_sent_at) VALUES (?, ?)
      ON CONFLICT(email) DO UPDATE SET last_sent_at = ?
    `).run(email, now, now);
  },
};
