import { Context, Validator } from 'hono'
import { getApplicationSettings } from '../../utils/application';
import { createSession } from '../../utils/session';
import { createAndSaveTokens } from '../../utils/token';
import { getUserByEmail } from '../../utils/user';

type LoginRequest = {
    email: string;
    password: string;
}


export function validator(v: Validator) {
    return (
        {
            email: v.json('email').isRequired(),
            password: v.json('password').isRequired(),
        }
    )
}

const comparePasswords = (password: string, storedPassword: string): boolean => {
    return password === storedPassword;
}

const loginController = async (c: Context) => {
    const body = await c.req.json<LoginRequest>()
    const { email, password } = body;
    const applicationName = c.get('applicationName') as string
    const applicationId = c.get('applicationId') as string
    try {
        const user = await getUserByEmail(c, email as string, applicationId, ['id', 'password', 'email_verified', 'name'])
        if (!user) {
            return c.text('User not found.', 400)
        }
        const { id, password: storedPassword, email_verified: emailVerified, name } = user;
        if (!comparePasswords(password as string, storedPassword as string)) {
            return c.text('Invalid password', 401)
        }

        const sessionId = await createSession(c, applicationId);

        const {
            expires_in: expiresIn,
        } = await getApplicationSettings(c, applicationId, ['expires_in'])

        const { idToken, refreshToken } = await createAndSaveTokens(
            c,
            {
                applicationName, expiresIn, id, sessionId, email, emailVerified
            }
        )

        return c.json({
            id_token: idToken,
            email,
            refresh_token: refreshToken,
            expires_in: expiresIn,
            local_id: id,
            name,
        })

    } catch (err: any) {
        console.log(err)
        return c.text('Error during login.', 500)
    }
}

export default loginController;
