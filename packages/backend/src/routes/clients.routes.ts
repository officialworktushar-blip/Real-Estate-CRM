import { Router } from "express";
import { clientsController } from "../controllers/clients.controller";

const router = Router();

router.get("/", clientsController.list);
router.get("/:id", clientsController.getById);
router.post("/", clientsController.create);
router.put("/:id", clientsController.update);
router.delete("/:id", clientsController.remove);

export default router;
