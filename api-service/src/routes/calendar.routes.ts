import { Router } from "express";
import { updateSchedules } from "../controllers/calendar.controller";

const router: Router = Router();

router.get("/updateSchedules", updateSchedules);

export default router;
