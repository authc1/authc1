import { Context, MiddlewareHandler, Next } from "hono";
import { getTokenByUserIdAndTokenId } from "../utils/user";
import { setUnauthorizedResponse, verify } from "./jwt";

type IdRequest = {
    id_token: string;
}

export function validateIdToken(): MiddlewareHandler {
    return async (c: Context, next: Next) => {
        const { id_token: idToken } = await c.req.json<IdRequest>()
        if (!idToken) {
            return setUnauthorizedResponse(c)
        }
        const payload = await verify(c, idToken, c.env.SECRET_KEY)
        const tokens = await getTokenByUserIdAndTokenId(c, payload.user_id, idToken, ['id_token', 'session_id'])
        if (!tokens || tokens.id_token !== idToken) {
            setUnauthorizedResponse(c)
            return;
        }
        c.set('user', payload)
        c.set('sessionId', tokens.session_id)
        await next()
    }
}
