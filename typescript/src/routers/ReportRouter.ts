import Express from "express";
import { ReportController } from "../controllers/ReportController";

const ReportRouter = Express.Router();

ReportRouter.get("/workload", ReportController.workloadReportHandler);

export default ReportRouter;
