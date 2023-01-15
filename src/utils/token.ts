import { Context } from "hono";
import { sign } from "../middleware/jwt";
import { generateUniqueId } from "./string";

interface Payload {
    id: string;
    sessionId: string;
    expiresIn: number;
    applicationName: string;
    email: string;
    emailVerified: boolean;
}

export const createAndSaveTokens = async (c: Context, payload: Payload) => {
    const { applicationName, expiresIn, id, sessionId, email, emailVerified = false } = payload;
    try {
        // TODO: Based on application settings
        const idToken = sign({
            iss: `${c.env.VERIFY_EMAIL_ENDPOINT}/${applicationName}`,
            aud: applicationName,
            auth_time: Date.now() / 1000,
            user_id: id,
            exp: Math.floor(Date.now() / 1000) + expiresIn,
            iat: Math.floor(Date.now() / 1000),
            email,
            email_verified: emailVerified,
            sign_in_provider: 'password'
        }, c.env.JWT_SECRET, 'HS256');

        const refreshToken = `0x${generateUniqueId()}${generateUniqueId()}`

        await c.env.AUTHC1.prepare(`INSERT INTO tokens (user_id, session_id, id_token, refresh_token created_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`)
            .bind(id, sessionId, idToken, refreshToken)
            .run()

        return {
            idToken,
            refreshToken
        };
    } catch (err) {
        throw err;
    }
}