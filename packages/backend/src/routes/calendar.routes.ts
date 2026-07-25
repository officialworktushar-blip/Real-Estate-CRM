import { Router } from "express";
import { calendarController } from "../controllers/calendar.controller";

const router = Router();

router.get("/", calendarController.list);
router.get("/:id", calendarController.getById);
router.post("/", calendarController.create);
router.put("/:id", calendarController.update);
router.delete("/:id", calendarController.remove);

export default router;
