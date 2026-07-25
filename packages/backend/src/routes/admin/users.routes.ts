import { Router } from "express";
import { adminUsersController } from "../../controllers/admin/users.controller";

const router = Router();

router.get("/", adminUsersController.list);
router.get("/:id", adminUsersController.getById);
router.put("/:id/role", adminUsersController.updateRole);
router.delete("/:id", adminUsersController.deactivate);

export default router;
