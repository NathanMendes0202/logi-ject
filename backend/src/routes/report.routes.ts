import { Router } from "express";
import { authenticate } from "../middlewares/auth.js";
import * as controller from "../controllers/report.controller.js";
const router = Router();
router.use(authenticate);
router.get("/dashboard", controller.dashboard);
router.get("/movements", controller.movements);
router.get("/stock", controller.stock);
export default router;
