import { Router } from "express";
import {
  getBigEastTeams,
  getGames,
  updateSchedules,
} from "../controllers/calendar.controller";

const router: Router = Router();

router.post("/updateSchedules", updateSchedules);
router.get("/getTeams", getBigEastTeams);
router.get("/getGames", getGames);
export default router;
