import { Router } from "express";
import {
  getBigEastTeams,
  updateSchedules,
} from "../controllers/calendar.controller";

const router: Router = Router();

router.post("/updateSchedules", updateSchedules);
router.get("/getTeams", getBigEastTeams);

export default router;
