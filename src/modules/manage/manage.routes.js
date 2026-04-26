import { Router } from "express";
import { isAuthenticated } from "../../middleware/auth.js";
import { RBAC } from "../../middleware/rbac.js";
import { csrfProtection } from "../../middleware/csrf.js";
import * as controller from "./manage.controller.js";

const router = Router();

// Only admins can access manage routes
router.get("/teachers", isAuthenticated, RBAC(["admin"]), controller.listTeachers);
router.get("/teachers/edit/:id", isAuthenticated, RBAC(["admin"]), csrfProtection, controller.editTeacher);
router.post("/teachers/edit/:id", isAuthenticated, RBAC(["admin"]), csrfProtection, controller.postEditTeacher);

router.get('/addTeacher', isAuthenticated, RBAC(["admin"]), csrfProtection, controller.addTeacher);
router.post('/addTeacher', isAuthenticated, RBAC(["admin"]), csrfProtection, controller.postAddTeacher);

export default router;
