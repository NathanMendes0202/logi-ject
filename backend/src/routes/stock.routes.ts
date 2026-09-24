import { Router } from "express";
import { authenticate } from "../middlewares/auth.js";
import * as controller from "../controllers/stock.controller.js";

const router = Router();
router.use(authenticate);
router.get("/summary", controller.summary);
router.get("/", controller.index);
export default router;
