import { z } from "zod";

export const applicationSettingsSchema = z.object({
  application_id: z.string().optional(),
  expires_in: z.number().optional().nullable(),
  secret: z.string().optional().nullable(),
  algorithm: z.string().optional().nullable(),
  redirect_uri: z.string().optional().nullable(),
  password_regex: z.string().optional(),
  two_factor_authentication: z.coerce.boolean().optional(),
  allow_multiple_accounts: z.coerce.boolean().optional(),
  session_expiration_time: z.number().optional().nullable(),
  password_reset_enabled: z.coerce.boolean().optional(),
  account_deletion_enabled: z.coerce.boolean().optional(),
  failed_login_attempts: z.number().optional(),
  sender_email: z.string().optional().nullable(),
  email_template_body: z.string().optional().nullable(),
  email_template_subject: z.string().optional().nullable(),
  email_verification_enabled: z.coerce.boolean().optional(),
  email_verification_method: z.string().optional(),
  text_template_body: z.string().optional().nullable(),
  phone_verification_enabled: z.coerce.boolean().optional(),
});

export const applicationSchema = z.object({
  id: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  name: z.string().optional(),
  user_id: z.string().optional(),
  logo: z.string().optional(),
  settings: applicationSettingsSchema,
});

export type ApplicationSchema = z.infer<typeof applicationSchema>;
export type ApplicationSettingsSchema = z.infer<
  typeof applicationSettingsSchema
>;
