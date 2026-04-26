import { Router } from "express";
import { csrfProtection } from "../../middleware/csrf.js";
import { isAuthenticated } from "../../middleware/auth.js";
import { RBAC } from "../../middleware/rbac.js";
import * as controller from "./student.controller.js"

const router=Router();

router.get("/studentHome/:id",isAuthenticated,RBAC(["student"]),controller.renderhome);
router.get('/addStudent',isAuthenticated,RBAC(["admin", "teacher"]),csrfProtection,controller.addStudent);
router.get('/searchStudent',isAuthenticated,RBAC(["admin", "teacher"]),csrfProtection,controller.searchStudent);
router.get('/deleteStudent',isAuthenticated,RBAC(["admin"]),csrfProtection,controller.deleteStudent);
router.get('/editStudent/:id',isAuthenticated,RBAC(["admin", "teacher"]),csrfProtection,controller.editStudent);
router.post('/editStudent/:id',isAuthenticated,RBAC(["admin", "teacher"]),csrfProtection,controller.postEditStudent);
router.get('/displayStudents',isAuthenticated,RBAC(["admin", "teacher"]),controller.displayStudents);
router.post('/addStudent',isAuthenticated,RBAC(["admin", "teacher"]),csrfProtection,controller.postaddstudent);
router.post('/searchStudent',isAuthenticated,RBAC(["admin", "teacher"]),csrfProtection,controller.postSearchStudent);
router.post('/deleteStudent/:search_id',isAuthenticated,RBAC(["admin"]),csrfProtection,controller.postdeletestudent);

export default router;



