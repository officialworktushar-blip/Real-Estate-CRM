import { Router } from "express";
import { clientsController } from "../controllers/clients.controller";
import { validate } from "../middleware/validate";
import { createClientSchema, updateClientSchema } from "../validators";

const router = Router();

router.get("/", clientsController.list);
router.get("/:id", clientsController.getById);
router.post("/", validate(createClientSchema), clientsController.create);
router.put("/:id", validate(updateClientSchema), clientsController.update);
router.delete("/:id", clientsController.remove);

export default router;
