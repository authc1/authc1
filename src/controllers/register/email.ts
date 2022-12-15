import { Context, Validator } from 'hono'

type EmailRequest = {
  name: string;
  email: string;
  password?: string;
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


const checkIfUserExists = async (c: Context, email: string): Promise<boolean> => {
  try {
    const { results } = await c.env.AUTHC1.prepare(
      "SELECT * FROM users WHERE email = ?"
    )
      .bind(email)
      .all()
    if (results?.length) {
      return true
    }

    return false
  } catch (err) {
    throw err
  }
}

const saveUser = async (c: Context, name: string, email: string, password: string, providerId: number): Promise<void> => {
  try {
    await c.env.AUTHC1.prepare(`INSERT INTO users (name, email, password, provider_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`)
                    .bind( name, email, password, providerId)
                    .run()
  } catch (err) {
    throw err
  }
}

const emailRegistrationController = async (c: Context) => {
  const body = await c.req.json<EmailRequest>()
  const { name, email, password } = body;
  try {
    if (await checkIfUserExists(c, email as string)) {
      return c.text('User already exists.', 400)
    }

    await saveUser(c, name as string, email as string, password as string, 1)
    return c.json({
      success: true,
      message: 'User registered successfully'
    });
  } catch (err) {
    console.log(err)
    return c.text('Error saving user to the database.', 500)
  }
}

export default emailRegistrationController;

