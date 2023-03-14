import { Context } from "hono";
import { generateUniqueIdWithPrefix } from "./string";

export const createSession = async (c: Context, applicationId: string, id: string): Promise<string> => {
    try {
        const sessionId = generateUniqueIdWithPrefix();
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
        } = c.req?.raw?.cf;

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

        await c.env.AUTHC1.prepare(`INSERT INTO sessions (id, metadata, ip, user_agent, region, application_id, user_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)`)
            .bind(sessionId, metadata, ip, userAgent, region, applicationId, id)
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

        await c.env.AUTHC1.prepare(`UPDATE sessions SET ${updateString} WHERE id = ?`)
            .bind(...values, sessionId)
            .run();
    } catch (err) {
        throw err;
    }
};

export const getSessionById = async (c: Context, sessionId: string, columns: string[]): Promise<any> => {
    try {
        const columnsString = columns.join(', ');
        const { results } = await c.env.AUTHC1.prepare(
            `SELECT ${columnsString} FROM sessions WHERE id = ?`
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


