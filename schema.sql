DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS user_providers;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS access_tokens;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS providers;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS user_permissions;
DROP TABLE IF EXISTS providers_credentials;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  name TEXT,
  nickname TEXT,
  avatar_url TEXT DEFAULT '' NOT NULL,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  password TEXT,
  provider_id INTEGER,
  application_id INTEGER,
  last_login DATETIME,
  status TEXT,
  confirmed_at DATETIME,
  invited_at DATETIME,
  email_verified BOOLEAN DEFAULT false NOT NULL,
  phone_number_verified BOOLEAN DEFAULT false NOT NULL,
  FOREIGN KEY (provider_id) REFERENCES providers(id),
  FOREIGN KEY (application_id) REFERENCES applications(id)
);

CREATE TABLE IF NOT EXISTS user_providers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  user_id uuid NOT NULL,
  provider_id text NOT NULL,
  provider_user_id text NOT NULL,
  UNIQUE (user_id, provider_id),
  UNIQUE (provider_id, provider_user_id)
);

CREATE TABLE IF NOT EXISTS roles (
  id INTEGER PRIMARY KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  name TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  client_id BLOB NOT NULL,
  name TEXT NOT NULL,
  redirect_uri TEXT NOT NULL,
  owner_id INTEGER,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE sessions (
  id INTEGER PRIMARY KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  user_id INTEGER,
  session_id TEXT,
  metadata TEXT,
  ip TEXT,
  user_agent TEXT,
  area TEXT,
  expiration_timestamp DATETIME,
  email_verify_code TEXT,
  phone_verify_code TEXT,
  application_id INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id)
  FOREIGN KEY (application_id) REFERENCES applications (id)
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  token TEXT UNIQUE,
  user_id INTEGER,
  application_id INTEGER,
  expires_at DATETIME NOT NULL,
  revoked BOOLEAN,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (application_id) REFERENCES applications (id)
);

CREATE TABLE IF NOT EXISTS access_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  token TEXT UNIQUE,
  user_id INTEGER,
  application_id INTEGER,
  expires_at DATETIME NOT NULL,
  revoked BOOLEAN,
  FOREIGN KEY (user_id) REFERENCES users (id),
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
  description TEXT,
  data JSON
);

CREATE TABLE IF NOT EXISTS application_providers (
  application_id INTEGER,
  provider_id INTEGER,
  FOREIGN KEY (application_id) REFERENCES applications(id),
  FOREIGN KEY (provider_id) REFERENCES providers(id)
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id INTEGER NOT NULL,
  role_id INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS user_permissions (
  user_id INTEGER NOT NULL,
  permission_id INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (permission_id) REFERENCES permissions(id)
);

CREATE TABLE IF NOT EXISTS user_sessions (
  user_id INTEGER NOT NULL,
  session_id INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

CREATE TABLE IF NOT EXISTS providers_credentials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  provider_id INTEGER NOT NULL,
  key TEXT NOT NULL,
  secret TEXT NOT NULL
);

-- Insert a new application
INSERT INTO applications (name, redirect_uri, client_id)
VALUES ('My Application', 'http://example.com/redirect', '0x1aec66176882a6ccbc004bcbfc7abdbbe458d90c40');

-- Insert a new provider
INSERT INTO providers (name, description, created_at, updated_at)
VALUES ('Email', 'Email login with password.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert a new user, using the values stored in the local variables
INSERT INTO users (name, email, phone, password, provider_id, application_id)
VALUES ('John Doe', 'johndoe@example.com', '1234567890', 'password123', 1, 1);

UPDATE applications
SET owner_id = 1
WHERE client_id = '0x1aec66176882a6ccbc004bcbfc7abdbbe458d90c40';