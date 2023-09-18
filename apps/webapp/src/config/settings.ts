export interface FormItem {
  key: string;
  name?: string;
  label: string;
  inputType: string;
  onChange?: any;
  editable: boolean;
  column?: boolean;
  maxInputNumber?: number;
  options?: Array<{ value: string | boolean; label: string }>;
}

export const settingsFields: FormItem[] = [
  {
    key: "application_id",
    name: "application_id",
    label: "Application ID (X-Authc1-Id)",
    inputType: "input",
    editable: false,
  },
  {
    key: "is_dev_mode",
    label: "Still on development mode?",
    inputType: "radio",
    editable: true,
    options: [
      { label: "True", value: true },
      { label: "False", value: false },
    ],
  },
  {
    key: "dev_mode_code",
    label: "Verification / OTP code can be used for testing",
    inputType: "input",
    editable: true,
  },
  {
    key: "settings.redirect_uri[]",
    name: "redirect_uri",
    label: "Redirect URI",
    inputType: "list",
    editable: true,
    maxInputNumber: 3,
  },
  {
    key: "settings.expires_in",
    name: "expires_in",
    label: "Expires In (in seconds)",
    inputType: "input",
    editable: true,
  },
  {
    key: "settings.secret",
    name: "secret",
    label: "Secret",
    inputType: "input",
    editable: false,
  },
  {
    key: "settings.algorithm",
    name: "algorithm",
    label: "Algorithm",
    inputType: "dropdown",
    editable: false,
    options: [
      { label: "HS256", value: "HS256" },
      { label: "HS384", value: "HS384" },
      { label: "HS512", value: "HS512" },
    ],
  },
  {
    key: "settings.session_expiration_time",
    name: "session_expiration_time",
    label: "Session Expiration Time (in seconds)",
    inputType: "input",
    editable: true,
  },
  {
    key: "settings.allow_multiple_accounts",
    name: "allow_multiple_accounts",
    label: "User account linking",
    inputType: "radio",
    editable: true,
    column: true,
    options: [
      {
        label: "Create multiple accounts for each identity provider",
        value: true,
      },
      { label: "Link accounts that use the same email", value: false },
    ],
  },
  {
    key: "settings.account_deletion_enabled",
    name: "account_deletion_enabled",
    label: "Account Deletion Enabled",
    inputType: "radio",
    editable: true,
    options: [
      { label: "True", value: true },
      { label: "False", value: false },
    ],
  },
  {
    key: "settings.failed_login_attempts",
    name: "failed_login_attempts",
    label: "Failed Login Attempts",
    inputType: "input",
    editable: false,
  },
];

interface ProviderDataOption {
  label: string;
  value: boolean | string;
}

interface ProviderDataKey {
  key: string;
  label: string;
  value: string | boolean;
  inputType: "input" | "radio" | "dropdown";
  editable: boolean;
  options?: ProviderDataOption[];
}

export interface ProviderData {
  key: string;
  label: string;
  inactive: boolean;
  canCopy?: boolean;
  data: ProviderDataKey[];
}

export type ProvidersData = ProviderData[];

export const providersSettings: ProvidersData = [
  {
    key: "email",
    label: "Email",
    inactive: false,
    canCopy: false,
    data: [
      {
        key: "email_provider_enabled",
        label: "Enable Email based signup and login",
        value: "",
        inputType: "radio",
        editable: true,
        options: [
          { label: "True", value: true },
          { label: "False", value: false },
        ],
      },
      {
        key: "email_verification_enabled",
        label: "Verify their email address for the first time users.",
        value: "",
        inputType: "radio",
        editable: true,
        options: [
          { label: "True", value: true },
          { label: "False", value: false },
        ],
      },
      {
        key: "code_expires_in",
        label: "Code Expires In (in seconds)",
        value: "",
        inputType: "input",
        editable: true,
      },
      {
        key: "sender_email",
        label: "Sender Email",
        value: "",
        inputType: "input",
        editable: false,
      },
      {
        key: "email_template_body",
        label: "Template Body",
        value: "",
        inputType: "input",
        editable: true,
      },
      {
        key: "email_template_subject",
        label: "Template Subject",
        value: "",
        inputType: "input",
        editable: true,
      },
      {
        key: "email_verification_method",
        label: "Verification Method",
        value: "",
        inputType: "dropdown",
        editable: false,
        options: [
          { label: "Code", value: "code" },
          { label: "Link", value: "link" },
        ],
      },
      {
        key: "reset_confirmation_email",
        label: "Reset Confirmation Email",
        value: "",
        inputType: "radio",
        editable: true,
        options: [
          { label: "True", value: true },
          { label: "False", value: false },
        ],
      },
      {
        key: "password_regex",
        label: "Password Regex",
        value: "",
        inputType: "input",
        editable: true,
      },
    ],
  },
  {
    key: "phone",
    label: "Phone",
    inactive: false,
    canCopy: false,
    data: [
      {
        key: "phone_provider_enabled",
        label: "Enabled",
        value: "",
        inputType: "radio",
        editable: true,
        options: [
          { label: "True", value: true },
          { label: "False", value: false },
        ],
      },
      {
        key: "text_template_body",
        label: "Template Body",
        value: "",
        inputType: "input",
        editable: true,
      },
    ],
  },
  {
    key: "apple",
    label: "Apple",
    inactive: false,
    canCopy: true,
    data: [
      {
        key: "apple_provider_enabled",
        label: "Enabled",
        inputType: "radio",
        value: "",
        editable: true,
        options: [
          { label: "True", value: true },
          { label: "False", value: false },
        ],
      },
      {
        key: "apple_team_id",
        label: "Team ID",
        inputType: "input",
        value: "",
        editable: true,
      },
      {
        key: "apple_key_id",
        label: "Key ID",
        inputType: "input",
        value: "",
        editable: true,
      },
      {
        key: "apple_client_id",
        label: "Client ID",
        inputType: "input",
        value: "",
        editable: true,
      },
      {
        key: "apple_private_key",
        label: "Private Key",
        inputType: "input",
        value: "",
        editable: true,
      },
      {
        key: "apple_redirect_uri",
        label: "Redirect URI",
        inputType: "input",
        value: "",
        editable: true,
      },
      {
        key: "apple_scope",
        label: "Scope",
        inputType: "input",
        value: "",
        editable: true,
      },
    ],
  },
  {
    key: "discord",
    label: "Discord",
    inactive: true,
    canCopy: true,
    data: [
      {
        key: "discord_provider_enabled",
        label: "Enabled",
        inputType: "radio",
        value: "",
        editable: true,
        options: [
          { label: "True", value: true },
          { label: "False", value: false },
        ],
      },
      {
        key: "discord_client_id",
        label: "Client ID",
        inputType: "input",
        value: "",
        editable: true,
      },
      {
        key: "discord_client_secret",
        label: "Client Secret",
        inputType: "input",
        value: "",
        editable: true,
      },
      {
        key: "discord_redirect_uri",
        label: "Redirect URI",
        inputType: "input",
        value: "",
        editable: true,
      },
      {
        key: "discord_scope",
        label: "Scope",
        inputType: "input",
        value: "",
        editable: true,
      },
    ],
  },
  {
    key: "facebook",
    label: "Facebook",
    inactive: true,
    canCopy: true,
    data: [
      {
        key: "facebook_provider_enabled",
        label: "Enabled",
        inputType: "radio",
        value: "",
        editable: true,
        options: [
          { label: "True", value: true },
          { label: "False", value: false },
        ],
      },
      {
        key: "facebook_client_id",
        label: "Client ID",
        inputType: "input",
        value: "",
        editable: true,
      },
      {
        key: "facebook_client_secret",
        label: "Client Secret",
        inputType: "input",
        value: "",
        editable: true,
      },
      {
        key: "facebook_redirect_uri",
        label: "Redirect URI",
        inputType: "input",
        value: "",
        editable: true,
      },
      {
        key: "facebook_scope",
        label: "Scope",
        inputType: "input",
        value: "",
        editable: true,
      },
    ],
  },
  {
    key: "github",
    label: "Github",
    inactive: false,
    canCopy: true,
    data: [
      {
        key: "github_provider_enabled",
        label: "Enabled",
        inputType: "radio",
        value: "",
        editable: true,
        options: [
          { label: "True", value: true },
          { label: "False", value: false },
        ],
      },
      {
        key: "github_client_id",
        label: "Client ID",
        inputType: "input",
        value: "",
        editable: true,
      },
      {
        key: "github_client_secret",
        label: "Client Secret",
        inputType: "input",
        value: "",
        editable: true,
      },
      {
        key: "github_scope",
        label: "Scope",
        inputType: "input",
        value: "",
        editable: false,
      },
    ],
  },
  {
    key: "google",
    label: "Google",
    inactive: true,
    canCopy: true,
    data: [
      {
        key: "google_provider_enabled",
        label: "Enabled",
        inputType: "radio",
        value: "",
        editable: true,
        options: [
          { label: "True", value: true },
          { label: "False", value: false },
        ],
      },
      {
        key: "google_client_id",
        label: "Client ID",
        inputType: "input",
        value: "",
        editable: true,
      },
      {
        key: "google_client_secret",
        label: "Client Secret",
        inputType: "input",
        value: "",
        editable: true,
      },
      {
        key: "google_redirect_uri",
        label: "Redirect URI",
        inputType: "input",
        value: "",
        editable: true,
      },
      {
        key: "google_scope",
        label: "Scope",
        inputType: "input",
        value: "",
        editable: true,
      },
    ],
  },
  {
    label: "LinkedIn",
    key: "linkedin",
    inactive: true,
    canCopy: true,
    data: [
      {
        key: "linkedin_provider_enabled",
        label: "Enabled",
        inputType: "radio",
        value: "",
        editable: true,
        options: [
          { label: "True", value: true },
          { label: "False", value: false },
        ],
      },
      {
        key: "linkedin_client_id",
        label: "Client ID",
        inputType: "input",
        value: "",
        editable: true,
      },
      {
        key: "linkedin_client_secret",
        label: "Client Secret",
        inputType: "input",
        value: "",
        editable: true,
      },
      {
        key: "linkedin_redirect_uri",
        label: "Redirect URI",
        inputType: "input",
        value: "",
        editable: true,
      },
      {
        key: "linkedin_scope",
        label: "Scope",
        inputType: "input",
        value: "",
        editable: true,
      },
    ],
  },
  {
    label: "Spotify",
    key: "spotify",
    inactive: true,
    canCopy: true,
    data: [
      {
        key: "spotify_provider_enabled",
        label: "Enabled",
        inputType: "radio",
        value: "",
        editable: true,
        options: [
          { label: "True", value: true },
          { label: "False", value: false },
        ],
      },
      {
        key: "spotify_client_id",
        label: "Client ID",
        inputType: "input",
        value: "",
        editable: true,
      },
      {
        key: "spotify_client_secret",
        label: "Client Secret",
        inputType: "input",
        value: "",
        editable: true,
      },
      {
        key: "spotify_redirect_uri",
        label: "Redirect URI",
        inputType: "input",
        value: "",
        editable: true,
      },
      {
        key: "spotify_scope",
        label: "Scope",
        inputType: "input",
        value: "",
        editable: true,
      },
    ],
  },
  {
    label: "Twitter",
    key: "twitter",
    inactive: true,
    canCopy: true,
    data: [
      {
        key: "twitter_provider_enabled",
        label: "Enabled",
        inputType: "radio",
        value: "",
        editable: true,
        options: [
          { label: "True", value: true },
          { label: "False", value: false },
        ],
      },
      {
        key: "twitter_client_id",
        label: "Client ID",
        inputType: "input",
        value: "",
        editable: true,
      },
      {
        key: "twitter_client_secret",
        label: "Client Secret",
        inputType: "input",
        value: "",
        editable: true,
      },
      {
        key: "twitter_redirect_uri",
        label: "Redirect URI",
        inputType: "input",
        value: "",
        editable: true,
      },
      {
        key: "twitter_scope",
        label: "Scope",
        inputType: "input",
        value: "",
        editable: true,
      },
    ],
  },
];
