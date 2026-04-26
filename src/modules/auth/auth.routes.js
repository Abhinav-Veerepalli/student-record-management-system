import { Router} from "express";
import * as controller from "./auth.controller.js";
const router = Router();

router.get("/", controller.roleSelection);
router.get("/role", controller.roleSelection);

router.get("/studentLogin", controller.studentLogin);
router.get("/adminLogin", controller.adminLogin);
router.get("/teacherLogin", controller.teacherLogin);

router.post("/studentLogin", controller.studentLoginPost);
router.post("/adminLogin", controller.adminLoginPost);
router.post("/teacherLogin", controller.teacherLoginPost);

router.get("/register/student", controller.showRegisterStudent);
router.post("/register/student", controller.registerStudent);

router.get("/register/teacher", controller.showRegisterTeacher);
router.post("/register/teacher", controller.registerTeacher);

router.get("/logout", controller.logout);

export default router;