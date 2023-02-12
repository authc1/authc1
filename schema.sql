DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS providers;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS user_permissions;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  name TEXT,
  nickname TEXT,
  avatar_url TEXT DEFAULT '' NOT NULL,
  email TEXT,
  phone TEXT,
  password TEXT,
  provider_id INTEGER NOT NULL,
  provider_user_id text,
  application_id TEXT,
  last_login DATETIME,
  status TEXT,
  confirmed_at DATETIME,
  invited_at DATETIME,
  email_verified BOOLEAN DEFAULT false NOT NULL,
  phone_number_verified BOOLEAN DEFAULT false NOT NULL,
  FOREIGN KEY (provider_id) REFERENCES providers(id),
  FOREIGN KEY (application_id) REFERENCES applications(id),
  UNIQUE (email, application_id),
  UNIQUE (phone, application_id)
);

CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  name TEXT NOT NULL,
  logo TEXT,
  user_id TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS roles (
  id INTEGER PRIMARY KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  name TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS tokens (
  id TEXT PRIMARY KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  user_id TEXT NOT NULL,
  application_id TEXT NOT NULL,
  session_id TEXT,
  access_token TEXT,
  refresh_token TEXT,
  access_token_expiration DATETIME,
  refresh_token_expiration DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (application_id) REFERENCES applications(id),
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  user_id TEXT NOT NULL,
  application_id TEXT,
  name TEXT,
  session_id TEXT,
  metadata TEXT,
  ip TEXT,
  user_agent TEXT,
  region TEXT,
  expiration_timestamp DATETIME,
  email_verify_code TEXT,
  phone_verify_code TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (application_id) REFERENCES applications (id)
);

CREATE TABLE IF NOT EXISTS permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  name TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS providers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  name TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id TEXT NOT NULL,
  role_id INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS user_permissions (
  user_id TEXT NOT NULL,
  permission_id INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (permission_id) REFERENCES permissions(id)
);

CREATE TABLE IF NOT EXISTS user_sessions (
  user_id TEXT NOT NULL,
  session_id INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

CREATE TABLE IF NOT EXISTS application_settings (
  application_id TEXT PRIMARY KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_in INTEGER DEFAULT 86400,
  secret TEXT,
  algorithm TEXT DEFAULT 'HS256',
  redirect_uri TEXT,
  two_factor_authentication BOOLEAN DEFAULT false,
  session_expiration_time INTEGER,
  token_expiration_time INTEGER,
  account_deletion_enabled BOOLEAN DEFAULT true,
  failed_login_attempts INTEGER DEFAULT 5,
  UNIQUE (application_id)
);

CREATE TABLE IF NOT EXISTS application_ip_whitelist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id TEXT NOT NULL,
  ip VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id)
);

CREATE INDEX idx_sessions_user_id ON sessions (user_id);
CREATE INDEX idx_sessions_session_id ON sessions (session_id);

-- Insert a new application
INSERT INTO applications (id, name)
VALUES ('0xa5b73c5a97b240bda6eaa7edfd33cff0', 'Authc1');

INSERT INTO application_settings (application_id, secret)
VALUES ('0xa5b73c5a97b240bda6eaa7edfd33cff0', '0e09089d2fbe4179bad7ae085b4c8fdc1bf2f9318c234b809aa86e83fad5a1f7');

INSERT INTO providers (id, name, description, created_at, updated_at)
VALUES (1, 'Email', 'Email login with password.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO users (id, name, email, password, provider_id, application_id)
VALUES ('0x21e312fde025485db1e52e1b20899928', 'Subhendu Kundu', 'subhendukundu14@gmail.com', 'Admin@123', 1, '0xa5b73c5a97b240bda6eaa7edfd33cff0');

UPDATE applications
SET user_id = '0x21e312fde025485db1e52e1b20899928'
WHERE id = '0xa5b73c5a97b240bda6eaa7edfd33cff0';