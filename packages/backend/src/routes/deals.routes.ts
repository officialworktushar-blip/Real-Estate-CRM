import { Router } from "express";
import { dealsController } from "../controllers/deals.controller";

const router = Router();

router.get("/", dealsController.list);
router.get("/:id", dealsController.getById);
router.post("/", dealsController.create);
router.put("/:id", dealsController.update);
router.delete("/:id", dealsController.remove);

export default router;
