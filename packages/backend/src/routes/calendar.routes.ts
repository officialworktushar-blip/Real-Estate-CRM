import { Router } from "express";
import { calendarController } from "../controllers/calendar.controller";
import { validate } from "../middleware/validate";
import { createCalendarEventSchema, updateCalendarEventSchema } from "../validators";

const router = Router();

router.get("/", calendarController.list);
router.get("/:id", calendarController.getById);
router.post("/", validate(createCalendarEventSchema), calendarController.create);
router.put("/:id", validate(updateCalendarEventSchema), calendarController.update);
router.delete("/:id", calendarController.remove);

export default router;
