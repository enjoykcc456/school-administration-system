import Express from 'express'
import HealthcheckRouter from './routers/HealthcheckRouter'
import RegistrationRouter from './routers/RegistrationRouter'
import ReportRouter from './routers/ReportRouter'

const router = Express.Router()

router.use('/healthcheck', HealthcheckRouter)
router.use('/register', RegistrationRouter)
router.use('/reports', ReportRouter)

export default router
