import { Router } from "express";
import {isAuthenticated} from "../../middleware/auth.js";
import {RBAC} from "../../middleware/rbac.js";
import * as controller from "./admin.controller.js"
const router=Router();


//--admin home--//
router.get('/adminHome',isAuthenticated,RBAC(["admin"]),controller.adminHome);

export default router;

