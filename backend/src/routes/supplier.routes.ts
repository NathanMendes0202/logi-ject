import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.js";
import * as controller from "../controllers/supplier.controller.js";

const router = Router();
router.use(authenticate);
router.get("/", controller.index);
router.get("/:id", controller.show);
router.post("/", authorize("ADMIN", "SUPERVISOR"), controller.create);
router.put("/:id", authorize("ADMIN", "SUPERVISOR"), controller.update);
router.delete("/:id", authorize("ADMIN"), controller.remove);
export default router;
