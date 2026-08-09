import { Router } from "express";
import { dealsController } from "../controllers/deals.controller";
import { validate } from "../middleware/validate";
import { createDealSchema, updateDealSchema } from "../validators";

const router = Router();

router.get("/", dealsController.list);
router.get("/:id", dealsController.getById);
router.post("/", validate(createDealSchema), dealsController.create);
router.put("/:id", validate(updateDealSchema), dealsController.update);
router.delete("/:id", dealsController.remove);

export default router;
