import { Router } from "express";
import calendarRoutes from "./calendar.routes.js";

const router: Router = Router();

router.use("/calendar", calendarRoutes);

export default router;
