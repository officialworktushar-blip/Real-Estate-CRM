import { Router } from "express";
import { propertiesController } from "../controllers/properties.controller";
import { validate } from "../middleware/validate";
import { createPropertySchema, updatePropertySchema } from "../validators";

const router = Router();

router.get("/", propertiesController.list);
router.get("/:id", propertiesController.getById);
router.post("/", validate(createPropertySchema), propertiesController.create);
router.put("/:id", validate(updatePropertySchema), propertiesController.update);
router.delete("/:id", propertiesController.remove);

export default router;
