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
  id TEXT PRIMARY KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  name TEXT,
  nickname TEXT,
  avatar_url TEXT DEFAULT '' NOT NULL,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  password TEXT,
  salt BLOB,
  provider_id INTEGER,
  application_id TEXT,
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
  user_id TEXT NOT NULL,
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
  id TEXT PRIMARY KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  name TEXT NOT NULL,
  owner_id INTEGER,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  user_id TEXT NOT NULL,
  application_id TEXT NOT NULL,
  session_id INTEGER,
  id_token TEXT,
  access_token TEXT,
  refresh_token TEXT,
  access_token_expiration DATETIME NOT NULL,
  refresh_token_expiration DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (application_id) REFERENCES applications(id),
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

CREATE TABLE sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
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
  FOREIGN KEY (user_id) REFERENCES users(id)
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
  application_id TEXT,
  provider_id INTEGER,
  FOREIGN KEY (application_id) REFERENCES applications(id),
  FOREIGN KEY (provider_id) REFERENCES providers(id)
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

CREATE TABLE IF NOT EXISTS providers_credentials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  provider_id INTEGER NOT NULL,
  key TEXT NOT NULL,
  secret TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS application_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_in INTEGER DEFAULT 86400,
  secret TEXT,
  algorithm TEXT,
  redirect_uri TEXT NOT NULL,
  password_strength_requirement VARCHAR(255),
  two_factor_authentication BOOLEAN,
  session_expiration_time INTEGER,
  token_expiration_time INTEGER,
  password_reset_enabled BOOLEAN,
  account_deletion_enabled BOOLEAN,
  failed_login_attempts INTEGER,
  sender_email TEXT,
  email_template_body TEXT,
  email_template_subject TEXT,
  email_verification_enabled BOOLEAN,
  email_verification_method TEXT DEFAULT 'code',
  text_template_body TEXT,
  phone_verification_enabled BOOLEAN,
  FOREIGN KEY (application_id) REFERENCES applications(id)
);

CREATE TABLE IF NOT EXISTS application_ip_whitelist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id TEXT NOT NULL,
  ip VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id)
);

CREATE TABLE IF NOT EXISTS application_settings_providers (
  application_setting_id INTEGER NOT NULL,
  provider_id INTEGER NOT NULL,
  FOREIGN KEY (application_setting_id) REFERENCES application_settings(id),
  FOREIGN KEY (provider_id) REFERENCES providers(id),
  PRIMARY KEY (application_setting_id, provider_id)
);

CREATE INDEX idx_sessions_user_id ON sessions (user_id);
CREATE INDEX idx_sessions_session_id ON sessions (session_id);

-- Insert a new application
INSERT INTO applications (id, name, redirect_uri)
VALUES ('0xe31b8c39aeb08cf49e97836f17fa2e673bfb24d9', 'My Application', 'http://example.com/redirect');

-- Insert a new provider
INSERT INTO providers (name, description, created_at, updated_at)
VALUES ('Email', 'Email login with password.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert a new user, using the values stored in the local variables
INSERT INTO users (id, name, email, phone, password, provider_id, application_id)
VALUES ('0x1c73c9a44b3023134f7eac7ab30e9ab5a4615a76', 'John Doe', 'johndoe@example.com', '1234567890', 'password123', 1, '0xe31b8c39aeb08cf49e97836f17fa2e673bfb24d9');

UPDATE applications
SET owner_id = '0x1c73c9a44b3023134f7eac7ab30e9ab5a4615a76'
WHERE id = '0xe31b8c39aeb08cf49e97836f17fa2e673bfb24d9';
