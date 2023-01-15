import { Context } from "hono";
import { ITokens } from "../models/tokens";
import { IUsers } from "../models/users";


export const getUserByEmail = async (
    c: Context,
    email: string,
    applicationId: string,
    columns: string[]
): Promise<IUsers | null> => {
    try {
        const columnsString = columns.join(', ')
        const { results } = await c.env.AUTHC1.prepare(
            `SELECT ${columnsString} FROM users WHERE email = ? AND application_id = ?`
        )
            .bind(email, applicationId)
            .all()
        if (results?.length) {
            const [result] = results
            return result
        }

        return null
    } catch (err: any) {
        throw err
    }
}

export async function getTokenByUserIdAndTokenId(
    c: Context,
    user_id: number,
    token_id: string,
    columns: string[]
): Promise<ITokens | null> {
    try {
        const columnsString = columns.join(', ')
        const { results } = await c.env.AUTHC1.prepare(
            `SELECT ${columnsString} FROM tokens WHERE user_id = ? AND token_id = ?`
        )
            .bind(user_id, token_id)
            .all()
        if (results?.length) {
            const [result] = results
            return result
        }
        return null
    } catch (err) {
        throw err
    }
}

export const getUserBySessionId = async (
    c: Context,
    sessionId: string,
    columns: string[]
): Promise<IUsers | null> => {
    try {
        const columnsString = columns.join(', ');
        const { results } = await c.env.AUTHC1.prepare(
            `SELECT ${columnsString} FROM users
            INNER JOIN tokens ON tokens.user_id = users.id
            WHERE tokens.session_id = ?`
        )
            .bind(sessionId)
            .all()
        if (results?.length) {
            const [result] = results;
            return result
        }

        return null
    } catch (err: any) {
        throw err
    }
}



export const updateUser = async (c: Context, userId: string, updates: object): Promise<void> => {
    try {
        const setString = Object.keys(updates)
            .map((key) => `${key} = ?`)
            .join(', ');
        const values = Object.values(updates);
        await c.env.AUTHC1.prepare(`UPDATE users SET ${setString} WHERE id = ?`)
            .bind(...values, userId)
            .run();
    } catch (err) {
        throw err;
    }
}
