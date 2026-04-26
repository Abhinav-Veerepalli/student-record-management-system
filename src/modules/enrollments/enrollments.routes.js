import { Router } from "express";
import { isAuthenticated } from "../../middleware/auth.js";
import { RBAC } from "../../middleware/rbac.js";
import * as controller from "./enrollments.controller.js";

const router = Router();

router.get("/enroll", isAuthenticated, RBAC(["student"]), controller.showEnrollmentForm);
router.post("/enroll", isAuthenticated, RBAC(["student"]), controller.enrollStudent);

export default router;
