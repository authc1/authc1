import { Hono } from 'hono'
import { validator } from 'hono/validator'
import emailLoginController, { validator as emailLoginValidator } from '../controllers/login/email'

const loginRoutes = new Hono()

// loginRoutes.post('/email', validateIdToken())

loginRoutes.post("email", validator(emailLoginValidator), emailLoginController)

export { loginRoutes }