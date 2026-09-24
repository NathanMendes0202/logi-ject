import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.js";
import * as controller from "../controllers/movement.controller.js";

const router = Router();
router.use(authenticate);
router.get("/", controller.index);
router.post("/in", authorize("ADMIN", "SUPERVISOR", "OPERATOR"), controller.createInbound);
router.post("/out", authorize("ADMIN", "SUPERVISOR", "OPERATOR"), controller.createOutbound);
router.post("/transfer", authorize("ADMIN", "SUPERVISOR", "OPERATOR"), controller.createTransfer);
router.post("/adjustment", authorize("ADMIN", "SUPERVISOR"), controller.createAdjustment);
export default router;
