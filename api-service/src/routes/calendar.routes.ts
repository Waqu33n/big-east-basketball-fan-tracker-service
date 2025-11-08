import { Router } from "express";
import {
  getTeams,
  getGames,
  updateSchedules,
} from "../controllers/calendar.controller";

const router: Router = Router();

router.post("/updateSchedules", updateSchedules);
router.get("/getTeams", getTeams);
router.get("/getGames", getGames);
export default router;
