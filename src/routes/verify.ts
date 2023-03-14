import { Hono } from 'hono'

import emailValidationController from '../controllers/verify/email'
import { validateAccessToken } from '../middleware/validateAccessToken'
const verifyRoutes = new Hono()

verifyRoutes.use('*', validateAccessToken())

verifyRoutes.post("email", emailValidationController)

export { verifyRoutes }