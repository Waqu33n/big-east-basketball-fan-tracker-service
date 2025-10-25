import { Router } from "express";
import calendarRoutes from "./calendar.routes";

const router: Router = Router();

router.use("/calendar", calendarRoutes);

export default router;
