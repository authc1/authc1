import { Context } from "hono";
import { generateUniqueId } from "./string";

export const createSession = async (c: Context, applicationId: string): Promise<string> => {
    try {
        const sessionId = generateUniqueId();
        const ip = c.req.headers.get('x-real-ip') || c.req.headers.get('cf-connecting-ip') || c.req.headers.get('x-forwarded-for');
        const userAgent = c.req.headers.get("User-Agent") || "";
        const {
            latitude,
            longitude,
            timezone,
            region,
            country,
            continent,
            city,
            regionCode,
            postalCode,
            // @ts-ignore
        } = c.req?.cf

        const metadata = JSON.stringify({
            latitude,
            longitude,
            timezone,
            region,
            country,
            continent,
            city,
            regionCode,
            postalCode,
        })

        await c.env.AUTHC1.prepare(`INSERT INTO sessions (created_at, session_id, metadata, ip, user_agent, region, application_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
            .bind(new Date(), sessionId, metadata, ip, userAgent, region, applicationId)
            .run()

        return sessionId;
    } catch (err) {
        throw err
    }
}

export const updateSession = async (c: Context, sessionId: string, updates: { [key: string]: any }) => {
    try {
        let updateString = '';
        Object.entries(updates).forEach(([key, value], index) => {
            updateString += `${key} = ?`;
            if (index !== Object.entries(updates).length - 1) {
                updateString += ', ';
            }
        });

        const values = Object.values(updates);

        await c.env.AUTHC1.prepare(`UPDATE sessions SET ${updateString} WHERE session_id = ?`)
            .bind(...values, sessionId)
            .run();
    } catch (err) {
        throw err;
    }
};

export const getSessionById = async (c: Context, sessionId: string, columns: string[]): Promise<ISession | null> => {
    try {
        const columnsString = columns.join(', ');
        const { results } = await c.env.AUTHC1.prepare(
            `SELECT ${columnsString} FROM sessions WHERE session_id = ?`
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


