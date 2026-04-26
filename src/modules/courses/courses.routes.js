import { Router } from "express";
import { isAuthenticated } from "../../middleware/auth.js";
import { RBAC } from "../../middleware/rbac.js";
import * as controller from "./courses.controller.js";

const router = Router();

router.get("/addCourse", isAuthenticated, RBAC(["teacher"]), controller.showAddCourse);
router.post("/addCourse", isAuthenticated, RBAC(["teacher"]), controller.addCourse);
router.get("/listCourses", isAuthenticated, controller.listCourses);

export default router;
