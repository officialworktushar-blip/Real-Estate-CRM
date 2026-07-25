import { Router } from "express";
import { leadsController } from "../controllers/leads.controller";
import { validate } from "../middleware/validate";
import { createLeadSchema, updateLeadSchema } from "../validators";

const router = Router();

router.get("/", leadsController.list);
router.get("/:id", leadsController.getById);
router.post("/", validate(createLeadSchema), leadsController.create);
router.put("/:id", validate(updateLeadSchema), leadsController.update);
router.delete("/:id", leadsController.remove);

export default router;
