import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.js";
import * as controller from "../controllers/order.controller.js";

const router = Router();
router.use(authenticate);
router.get("/", controller.index);
router.get("/:id", controller.show);
router.post("/", authorize("ADMIN", "SUPERVISOR", "OPERATOR"), controller.create);
router.patch("/:id/status", authorize("ADMIN", "SUPERVISOR", "OPERATOR"), controller.updateStatus);
export default router;
