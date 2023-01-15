import { Context, Validator } from 'hono'
import { getApplicationSettings } from '../../utils/application'
import { createSession } from '../../utils/session'
import { createAndSaveTokens } from '../../utils/token'
import { getUserByEmail } from '../../utils/user'

type EmailRequest = {
  name: string;
  email: string;
  password: string;
}

interface Payload {
  id: number;
  sessionId: string;
  expiresIn: number;
  applicationName: string;
  email: string;
}

export function validator(v: Validator) {
  return (
    {
      name: v.json('name').isOptional(),
      email: v.json('email').isRequired(),
      password: v.json('password').isRequired(),
    }
  )
}

const saveUser = async (
  c: Context,
  name: string,
  email: string,
  password: string,
  providerId: number
): Promise<string> => {
  try {
    const result = await c.env.AUTHC1.prepare(`INSERT INTO users (name, email, password, provider_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id`)
      .bind(name, email, password, providerId)
      .run()
    return result.lastInsertRowid
  } catch (err: any) {
    throw err
  }
}

const emailRegistrationController = async (c: Context) => {
  const body = await c.req.json<EmailRequest>()
  const { email, password, name } = body
  try {
    const applicationId = c.get('applicationId') as string
    const applicationName = c.get('applicationName') as string
    const user = await getUserByEmail(c, email, applicationId, ['id'])
    if (user) {
      return c.text('Email already exists', 409)
    }

    const {
      expires_in: expiresIn,
    } = await getApplicationSettings(c, applicationId, ['expires_in'])

    const [sessionId, id] = await Promise.all([
      createSession(c, applicationId),
      saveUser(c, name, email, password, 1)
    ])

    const { idToken, refreshToken } = await createAndSaveTokens(
      c,
      {
        id,
        expiresIn,
        sessionId,
        applicationName,
        email,
        emailVerified: false,
      }
    )
    return c.json({
      id_token: idToken,
      email,
      refresh_token: refreshToken,
      expires_in: expiresIn,
      local_id: id
    })
  } catch (err) {
    console.log(err)
    return c.text('Error during registration', 500)
  }
}

export default emailRegistrationController;
