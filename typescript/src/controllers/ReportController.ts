import { BAD_REQUEST } from "http-status-codes";
import { RequestHandler } from "express";

import Logger from "../config/logger";
import { getWorkloadReport } from "../utils/ReportUtils";

const LOG = new Logger("ReportController.ts");

const workloadReportHandler: RequestHandler = async (req, res, next) => {
  try {
    const teacher = await getWorkloadReport();
    res.send(teacher);
  } catch (e) {
    LOG.error(e);
    next(e);
  }
};

export const ReportController = { workloadReportHandler };
