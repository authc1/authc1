import { Context } from "hono";
import { UserClient } from "../do/AuthC1User";
import { OauthProvider, ProviderSettings } from "../models/provider";
import { ApplicationNotFoundError } from "./errors";
import { getProviderDefaultSettings } from "./kv";

export interface IApplicationSettings {
  id: number;
  application_id: string;
  created_at: Date;
  updated_at: Date;
  expires_in: number;
  secret: string;
  algorithm: string;
  two_factor_authentication: boolean;
  allow_multiple_accounts: boolean;
  session_expiration_time: number;
  account_deletion_enabled: boolean;
  failed_login_attempts: number;
}

export async function checkAccess(
  c: Context,
  key: string,
  applicationId: string
): Promise<boolean> {
  const userObjId = c.env.AuthC1User.idFromName(key);
  const stub = c.env.AuthC1User.get(userObjId);
  const userClient = new UserClient(stub);

  const accessableApps = await userClient.getAccess();

  const hasAccess = !!accessableApps[applicationId];
  return hasAccess;
}

export async function getProviderSettingsForProvider(
  c: Context,
  applicationId: string,
  providerName: string
): Promise<OauthProvider | null> {
  try {
    const providerSettings = await getProviderDefaultSettings(c, applicationId);

    if (!providerSettings) {
      throw new ApplicationNotFoundError("Application not found");
    }

    const providerSettingsForProvider: OauthProvider = {
      provider_enabled: false,
      client_id: "",
      client_secret: "",
      redirect_uri: "",
      scope: "",
    };

    switch (providerName) {
      case "discord":
        providerSettingsForProvider["provider_enabled"] =
          providerSettings.discord_provider_enabled;
        providerSettingsForProvider["client_id"] =
          providerSettings.discord_client_id;
        providerSettingsForProvider["client_secret"] =
          providerSettings.discord_client_secret;
        providerSettingsForProvider["redirect_uri"] =
          providerSettings.discord_redirect_uri;
        providerSettingsForProvider["scope"] = providerSettings.discord_scope;
        break;
      case "facebook":
        providerSettingsForProvider["provider_enabled"] =
          providerSettings.facebook_provider_enabled;
        providerSettingsForProvider["client_id"] =
          providerSettings.facebook_client_id;
        providerSettingsForProvider["client_secret"] =
          providerSettings.facebook_client_secret;
        providerSettingsForProvider["redirect_uri"] =
          providerSettings.facebook_redirect_uri;
        providerSettingsForProvider["scope"] = providerSettings.facebook_scope;
        break;
      case "apple":
        providerSettingsForProvider["provider_enabled"] =
          providerSettings.apple_provider_enabled;
        providerSettingsForProvider["team_id"] = providerSettings.apple_team_id;
        providerSettingsForProvider["key_id"] = providerSettings.apple_key_id;
        providerSettingsForProvider["client_id"] =
          providerSettings.apple_client_id;
        providerSettingsForProvider["private_key"] =
          providerSettings.apple_private_key;
        providerSettingsForProvider["redirect_uri"] =
          providerSettings.apple_redirect_uri;
        providerSettingsForProvider["scope"] = providerSettings.apple_scope;
        break;
      case "github":
        providerSettingsForProvider["provider_enabled"] =
          providerSettings.github_provider_enabled;
        providerSettingsForProvider["client_id"] =
          providerSettings.github_client_id;
        providerSettingsForProvider["client_secret"] =
          providerSettings.github_client_secret;
        providerSettingsForProvider["redirect_uri"] =
          providerSettings.github_redirect_uri;
        providerSettingsForProvider["scope"] = providerSettings.github_scope;
        break;
      case "google":
        providerSettingsForProvider["provider_enabled"] =
          providerSettings.google_provider_enabled;
        providerSettingsForProvider["client_id"] =
          providerSettings.google_client_id;
        providerSettingsForProvider["client_secret"] =
          providerSettings.google_client_secret;
        providerSettingsForProvider["redirect_uri"] =
          providerSettings.google_redirect_uri;
        providerSettingsForProvider["scope"] = providerSettings.google_scope;
        break;
      case "linkedin":
        providerSettingsForProvider["provider_enabled"] =
          providerSettings.linkedin_provider_enabled;
        providerSettingsForProvider["client_id"] =
          providerSettings.linkedin_client_id;
        providerSettingsForProvider["client_secret"] =
          providerSettings.linkedin_client_secret;
        providerSettingsForProvider["redirect_uri"] =
          providerSettings.linkedin_redirect_uri;
        providerSettingsForProvider["scope"] = providerSettings.linkedin_scope;
        break;
      case "spotify":
        providerSettingsForProvider["provider_enabled"] =
          providerSettings.spotify_provider_enabled;
        providerSettingsForProvider["client_id"] =
          providerSettings.spotify_client_id;
        providerSettingsForProvider["client_secret"] =
          providerSettings.spotify_client_secret;
        providerSettingsForProvider["redirect_uri"] =
          providerSettings.spotify_redirect_uri;
        providerSettingsForProvider["scope"] = providerSettings.spotify_scope;
        break;
      case "twitter":
        providerSettingsForProvider["provider_enabled"] =
          providerSettings.twitter_provider_enabled;
        providerSettingsForProvider["client_id"] =
          providerSettings.twitter_client_id;
        providerSettingsForProvider["client_secret"] =
          providerSettings.twitter_client_secret;
        providerSettingsForProvider["redirect_uri"] =
          providerSettings.twitter_redirect_uri;
        providerSettingsForProvider["scope"] = providerSettings.twitter_scope;
        break;
      case "twitch":
        providerSettingsForProvider["provider_enabled"] =
          providerSettings.twitch_provider_enabled;
        providerSettingsForProvider["client_id"] =
          providerSettings.twitch_client_id;
        providerSettingsForProvider["client_secret"] =
          providerSettings.twitch_client_secret;
        providerSettingsForProvider["redirect_uri"] =
          providerSettings.twitch_redirect_uri;
        providerSettingsForProvider["scope"] = providerSettings.twitch_scope;
        break;
      case "slack":
        providerSettingsForProvider["provider_enabled"] =
          providerSettings.slack_provider_enabled;
        providerSettingsForProvider["client_id"] =
          providerSettings.slack_client_id;
        providerSettingsForProvider["client_secret"] =
          providerSettings.slack_client_secret;
        providerSettingsForProvider["redirect_uri"] =
          providerSettings.slack_redirect_uri;
        providerSettingsForProvider["scope"] = providerSettings.slack_scope;
        break;
    }
    return providerSettingsForProvider;
  } catch (e) {
    console.log(e);
    return null;
  }
}
