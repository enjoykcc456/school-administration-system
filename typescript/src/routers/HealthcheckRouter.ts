import Express from 'express'
import { healthCheck } from '../controllers/HealthcheckController'

const HealthcheckRouter = Express.Router()

HealthcheckRouter.get('/', healthCheck.healthcheckHandler)

export default HealthcheckRouter
