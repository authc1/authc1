import { z } from "zod";

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

export const ProviderSettingsSchema = z.object({
  email_provider_enabled: z.boolean(),
  sender_email: z.string(),
  email_template_body: z.string(),
  email_template_subject: z.string(),
  email_verification_enabled: z.boolean(),
  email_verification_method: z.enum(["code", "link"]),
  reset_confirmation_email: z.boolean(),
  password_reset_enabled: z.boolean(),
  password_regex: z.string(),

  phone_provider_enabled: z.boolean(),
  text_template_body: z.string(),

  discord_provider_enabled: z.boolean(),
  discord_client_id: z.string(),
  discord_client_secret: z.string(),
  discord_redirect_uri: z.string(),
  discord_scope: z.string(),

  facebook_provider_enabled: z.boolean(),
  facebook_client_id: z.string(),
  facebook_client_secret: z.string(),
  facebook_redirect_uri: z.string(),
  facebook_scope: z.string(),

  apple_provider_enabled: z.boolean(),
  apple_team_id: z.string(),
  apple_key_id: z.string(),
  apple_client_id: z.string(),
  apple_private_key: z.string(),
  apple_scope: z.array(z.string()),
  apple_redirect_uri: z.string(),

  github_provider_enabled: z.boolean(),
  github_client_id: z.string(),
  github_client_secret: z.string(),
  github_redirect_uri: z.string(),
  github_scope: z.string(),

  google_provider_enabled: z.boolean(),
  google_client_id: z.string(),
  google_client_secret: z.string(),
  google_redirect_uri: z.string(),
  google_scope: z.string(),

  linkedin_provider_enabled: z.boolean(),
  linkedin_client_id: z.string(),
  linkedin_client_secret: z.string(),
  linkedin_redirect_uri: z.string(),
  linkedin_scope: z.string(),

  spotify_provider_enabled: z.boolean(),
  spotify_client_id: z.string(),
  spotify_client_secret: z.string(),
  spotify_redirect_uri: z.string(),
  spotify_scope: z.string(),

  twitter_provider_enabled: z.boolean(),
  twitter_client_id: z.string(),
  twitter_client_secret: z.string(),
  twitter_redirect_uri: z.string(),
  twitter_scope: z.string(),

  twitch_provider_enabled: z.boolean(),
  twitch_client_id: z.string(),
  twitch_client_secret: z.string(),
  twitch_redirect_uri: z.string(),
  twitch_scope: z.string(),

  slack_provider_enabled: z.boolean(),
  slack_client_id: z.string(),
  slack_client_secret: z.string(),
  slack_redirect_uri: z.string(),
  slack_scope: z.string(),
});

export type ProviderSettings = z.infer<typeof ProviderSettingsSchema>;
