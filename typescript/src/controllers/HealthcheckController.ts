import { RequestHandler } from 'express'
import { OK } from 'http-status-codes'

const healthcheckHandler: RequestHandler = async (req, res) => {
  return res.sendStatus(OK)
}

export const healthCheck = { healthcheckHandler }
