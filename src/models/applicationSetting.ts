export interface ApplicationSetting {
  expires_in?: number;
  secret?: string;
  algorithm?: string;
  redirect_uri?: string;
  two_factor_authentication?: boolean;
  session_expiration_time?: number;
  account_deletion_enabled?: boolean;
  failed_login_attempts?: number;
  created_at?: string;
  updated_at?: string;
}
