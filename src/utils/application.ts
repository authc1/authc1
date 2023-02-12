import { Context } from "hono";
import { ProviderSettings } from "../models/provider";
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
    session_expiration_time: number;
    token_expiration_time: number;
    account_deletion_enabled: boolean;
    failed_login_attempts: number;
}

export async function getApplicationSettings(c: Context, applicationId: string, columns: string[]): Promise<IApplicationSettings> {
    try {
        const columnsString = columns.join(', ');
        console.log(applicationId);
        const { results } = await c.env.AUTHC1.prepare(
            `SELECT ${columnsString} FROM application_settings WHERE application_id = ?`
        ).bind(applicationId).all()
        console.log(results);
        if (results?.length) {
            return results[0];
        }
        throw new ApplicationNotFoundError('Application not found');
    } catch (err) {
        throw err;
    }
}

export async function getApplicationProviderSettings(
    c: Context,
    applicationId: string
  ): Promise<ProviderSettings> {
    try {
      console.log(applicationId);
      const data = await getProviderDefaultSettings(c, applicationId);
      if(!data) {
          throw new ApplicationNotFoundError("Application not found");
      }
      return data;
    } catch (err) {
      throw err;
    }
  }
