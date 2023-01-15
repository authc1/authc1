import { Hono } from 'hono'
import { validator } from 'hono/validator'
import { confirmEmailControllerByCode, confirmEmailControllerByLink, confirmEmailByCodeValidator, confirmEmailByLinkValidator } from '../controllers/confirm/email'
import { validateIdToken } from '../middleware/validateIdToken'

const confirmRoutes = new Hono()

confirmRoutes.post('/email', validateIdToken())
//confirmRoutes.use('/email', validateIdToken())

confirmRoutes.post("email", validator(confirmEmailByCodeValidator), confirmEmailControllerByCode)
confirmRoutes.get("email", validator(confirmEmailByLinkValidator), confirmEmailControllerByLink)

export { confirmRoutes }