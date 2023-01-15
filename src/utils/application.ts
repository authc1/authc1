import { Context } from "hono";

interface IApplicationSettings {
    id: number;
    application_id: string;
    created_at: Date;
    updated_at: Date;
    expires_in: number;
    secret: string;
    algorithm: string;
    password_strength_requirement: string;
    two_factor_authentication: boolean;
    session_expiration_time: number;
    token_expiration_time: number;
    password_reset_enabled: boolean;
    account_deletion_enabled: boolean;
    failed_login_attempts: number;
    sender_email: string;
    email_template_body: string;
    email_template_subject: string;
    email_verification_enabled: boolean;
    email_verification_method: string;
    text_template_body: string;
    phone_verification_enabled: boolean;
}

export async function getApplicationSettings(c: Context, applicationId: string, columns: string[]): Promise<IApplicationSettings> {
    try {
        const columnsString = columns.join(', ');
        const { results } = await c.env.AUTHC1.prepare(
            `SELECT ${columnsString} FROM application_settings WHERE application_id = ?`
        ).bind(applicationId).all()
        if (results?.length) {
            return results[0];
        }
        throw new Error('Application not found')
    } catch (err) {
        throw err;
    }
}
