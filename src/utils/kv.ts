import { Context } from "hono";
import { ProviderSettings } from "../models/provider";

const defaultSettings: ProviderSettings = {
  email_provider_enabled: true,
  sender_email: "system@authc1.com",
  email_template_body: "Your Varification code is {{code}}",
  email_template_subject: "Your Varification code is {{code}}",
  email_verification_enabled: false,
  email_verification_method: "code",
  reset_confirmation_email: false,
  password_reset_enabled: true,
  password_regex: "^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9])(?=.*[a-z]).{8,}$",

  phone_provider_enabled: false,
  text_template_body: "",

  discord_provider_enabled: false,
  discord_client_id: "",
  discord_client_secret: "",
  discord_redirect_uri: "",
  discord_scope: "",

  facebook_provider_enabled: false,
  facebook_client_id: "",
  facebook_client_secret: "",
  facebook_redirect_uri: "",
  facebook_scope: "",

  apple_provider_enabled: false,
  apple_team_id: "",
  apple_key_id: "",
  apple_client_id: "",
  apple_private_key: "",
  apple_scope: "",
  apple_redirect_uri: "",

  github_provider_enabled: false,
  github_client_id: "",
  github_client_secret: "",
  github_redirect_uri: "",
  github_scope: "",

  google_provider_enabled: false,
  google_client_id: "",
  google_client_secret: "",
  google_redirect_uri: "",
  google_scope: "",

  linkedin_provider_enabled: false,
  linkedin_client_id: "",
  linkedin_client_secret: "",
  linkedin_redirect_uri: "",
  linkedin_scope: "",

  spotify_provider_enabled: false,
  spotify_client_id: "",
  spotify_client_secret: "",
  spotify_redirect_uri: "",
  spotify_scope: "",

  twitter_provider_enabled: false,
  twitter_client_id: "",
  twitter_client_secret: "",
  twitter_redirect_uri: "",
  twitter_scope: "",

  twitch_provider_enabled: false,
  twitch_client_id: "",
  twitch_client_secret: "",
  twitch_redirect_uri: "",
  twitch_scope: "",

  slack_provider_enabled: false,
  slack_client_id: "",
  slack_client_secret: "",
  slack_redirect_uri: "",
  slack_scope: "",
};

export function storeProviderSettings(
  c: Context,
  id: string,
  data: any = {}
) {
  const settings = {
    ...defaultSettings,
    ...data,
  };
  return c.env.AUTHC1_APPLICATION_PROVIDER_DETAILS.put(
    id,
    JSON.stringify(settings)
  );
}

export function getProviderDefaultSettings(c: Context, id: string) {
  return c.env.AUTHC1_APPLICATION_PROVIDER_DETAILS.get(id, { type: "json" });
}
