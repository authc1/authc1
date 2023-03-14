export interface Provider {
  id: number;
  name: string;
  description: string;
  data: any;
  created_at: Date;
  updated_at: Date;
}

export interface OauthProvider {
  provider_enabled: boolean;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  scope: string;
  team_id?: string;
  key_id?: string;
  private_key?: string;
}

export interface ProviderSettings {
  email_provider_enabled: boolean;
  sender_email: string;
  email_template_body: string;
  email_template_subject: string;
  email_verification_enabled: boolean;
  email_verification_method: string;
  reset_confirmation_email: boolean;
  password_reset_enabled: boolean;
  password_regex: string;

  phone_provider_enabled: boolean;
  text_template_body: string;

  discord_provider_enabled: boolean;
  discord_client_id: string;
  discord_client_secret: string;
  discord_redirect_uri: string;
  discord_scope: string;

  facebook_provider_enabled: boolean;
  facebook_client_id: string;
  facebook_client_secret: string;
  facebook_redirect_uri: string;
  facebook_scope: string;

  apple_provider_enabled: boolean;
  apple_team_id: string;
  apple_key_id: string;
  apple_client_id: string;
  apple_private_key: string;
  apple_redirect_uri: string;
  apple_scope: string;

  github_provider_enabled: boolean;
  github_client_id: string;
  github_client_secret: string;
  github_redirect_uri: string;
  github_scope: string;

  google_provider_enabled: boolean;
  google_client_id: string;
  google_client_secret: string;
  google_redirect_uri: string;
  google_scope: string;

  linkedin_provider_enabled: boolean;
  linkedin_client_id: string;
  linkedin_client_secret: string;
  linkedin_redirect_uri: string;
  linkedin_scope: string;

  spotify_provider_enabled: boolean;
  spotify_client_id: string;
  spotify_client_secret: string;
  spotify_redirect_uri: string;
  spotify_scope: string;

  twitter_provider_enabled: boolean;
  twitter_client_id: string;
  twitter_client_secret: string;
  twitter_redirect_uri: string;
  twitter_scope: string;

  twitch_provider_enabled: boolean;
  twitch_client_id: string;
  twitch_client_secret: string;
  twitch_redirect_uri: string;
  twitch_scope: string;

  slack_provider_enabled: boolean;
  slack_client_id: string;
  slack_client_secret: string;
  slack_redirect_uri: string;
  slack_scope: string;
}
