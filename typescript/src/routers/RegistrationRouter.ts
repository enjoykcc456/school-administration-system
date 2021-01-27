import Express from "express";
import { RegistrationController } from "../controllers/RegistrationController";

const RegistrationRouter = Express.Router();

RegistrationRouter.post("/", RegistrationController.registerHandler);

export default RegistrationRouter;
