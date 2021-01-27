import { BAD_REQUEST, NO_CONTENT } from 'http-status-codes'
import { RequestHandler } from 'express'

import sequelize from '../config/database'
import Logger from '../config/logger'
import { register } from '../utils/RegistrationUtils'
import { isEmpty } from '../utils/CommonUtils'

const LOG = new Logger('RegistrationController.ts')

const registerHandler: RequestHandler = async (req, res, next) => {
  if (!isEmpty(req.body)) {
    const transaction = await sequelize.transaction()

    try {
      await register(req.body, transaction)
      res.status(NO_CONTENT).send()
    } catch (e) {
      await transaction.rollback()
      LOG.error(e)
      next(e)
    }
  } else {
    res.status(BAD_REQUEST).send({
      message: 'Request body cannot be empty!',
    })
  }
}

export const RegistrationController = { registerHandler }
