import { Hono } from 'hono'
import { validator } from 'hono/validator'
import { confirmEmailControllerByCode, confirmEmailControllerByLink, confirmEmailByCodeValidator, confirmEmailByLinkValidator } from '../controllers/confirm/email'
import { validateAccessToken } from '../middleware/validateAccessToken'

const confirmRoutes = new Hono()

confirmRoutes.post('/email', validateAccessToken())

confirmRoutes.post("email", validator(confirmEmailByCodeValidator), confirmEmailControllerByCode)
confirmRoutes.get("email", validator(confirmEmailByLinkValidator), confirmEmailControllerByLink)

export { confirmRoutes }