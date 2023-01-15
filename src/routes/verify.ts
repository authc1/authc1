import { Hono } from 'hono'
import { validator } from 'hono/validator'

import emailValidationController from '../controllers/register/email'
import { validateIdToken } from '../middleware/validateIdToken'
const verifyRoutes = new Hono()

verifyRoutes.use('*', validateIdToken())

verifyRoutes.post("email", emailValidationController)

export { verifyRoutes }