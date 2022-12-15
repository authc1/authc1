import { Hono } from 'hono'
import { validator } from 'hono/validator'

import emailRegistrationController, { validator as emailRegistrationValidator } from '../controllers/users/register'
const registerRoutes = new Hono()

registerRoutes.post("email", validator(emailRegistrationValidator), emailRegistrationController)

export { registerRoutes }