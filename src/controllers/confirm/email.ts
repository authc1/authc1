import { Context, Validator } from 'hono'
import { html } from 'hono/html'
import { getSessionById } from '../../utils/session'
import { getUserBySessionId, updateUser } from '../../utils/user'

type ConfirmEmailByCodeRequest = {
    code: string;
}

export function confirmEmailByCodeValidator(v: Validator) {
    return (
        {
            code: v.json('code').isOptional(),
        }
    )
}

export function confirmEmailByLinkValidator(v: Validator) {
    return (
        {
            code: v.query('code').isRequired().message('code is required!'),
            session_id: v.query('session_id').isRequired().message('session_id is required!'),
        }
    )
}

export const confirmEmailControllerByCode = async (c: Context) => {
    const body = await c.req.json<ConfirmEmailByCodeRequest>()
    const { code } = body
    try {
        const sessionId = c.get('sessionId') as string
        const user = c.get("user")
        const session = await getSessionById(c, sessionId, ['expiration_timestamp', 'email_verify_code'])


        if (session.expiration_timestamp < (Date.now() / 1000) || session.email_verify_code !== code) {
            return c.text("Expired or invalid code.")
        }

        await updateUser(c, user.id, { email_verified: true, confirmed_at: new Date() });

        return c.json({
            local_id: user.id,
            email: user.email,
        })
    } catch (err) {
        console.log(err)
        return c.text('Error during registration', 500)
    }
}

export const confirmEmailControllerByLink = async (c: Context) => {
    const code = await c.req.query('code')
    const sessionId = await c.req.query('session_id')

    try {
        const session = await getSessionById(c, sessionId, ['expiration_timestamp', 'email_verify_code'])


        if (session.expiration_timestamp < (Date.now() / 1000) || session.email_verify_code !== code) {
            return c.text("Expired or invalid link.")
        }

        const user = await getUserBySessionId(c, 'some_session_id', ['id', 'name', 'email'])

        if (!user) {
            return c.text("Broken Link.")
        }

        await updateUser(c, user?.id, { email_verified: true, confirmed_at: new Date() });

        return c.html(
            html`<!DOCTYPE html>
            <html>
              <head>
                <title>Email Verification Success</title>
              </head>
              <body>
                <h1>Email Verified Successfully</h1>
                <p>Your email has been successfully verified. You can now go back to the application.</p>
              </body>
            </html>
            `
        )
    } catch (err) {
        console.log(err)
        return c.text('Error during registration', 500)
    }
}

