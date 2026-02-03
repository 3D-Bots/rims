export const CREATE_USERS_TABLE = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  sign_in_count INTEGER NOT NULL DEFAULT 0,
  last_sign_in_at TEXT,
  last_sign_in_ip TEXT,
  email_verified INTEGER NOT NULL DEFAULT 0,
  email_verification_token TEXT,
  email_verification_token_expires_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS email_rate_limits (
  email TEXT PRIMARY KEY,
  last_sent_at TEXT NOT NULL
);
`;
