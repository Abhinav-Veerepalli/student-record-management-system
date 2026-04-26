import { Router} from "express";
import { csrfProtection } from "../../middleware/csrf.js";
import { isAuthenticated } from "../../middleware/auth.js";
import { RBAC } from "../../middleware/rbac.js";
import * as controller from "./teacher.controller.js";

const router=Router();
router.get("/teacherhome",isAuthenticated,RBAC(["teacher"]),csrfProtection,controller.renderhome);

export default router;