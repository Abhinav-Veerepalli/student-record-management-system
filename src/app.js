import express from "express";
import cookieParser from "cookie-parser";
import passport from "passport";


import { sessionmiddleware } from "./modules/config/session.js";
import "./modules/config/passport.js";
import path from "path";
import { fileURLToPath } from "url";



import authRoutes from "./modules/auth/auth.routes.js";
import studentRoutes from "./modules/students/students.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import teacherRoutes from "./modules/teacher/teacher.routes.js";
import coursesRoutes from "./modules/courses/courses.routes.js";
import enrollmentsRoutes from "./modules/enrollments/enrollments.routes.js";
import manageRoutes from "./modules/manage/manage.routes.js";


const app = express();

/* ---------- core ---------- */
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* ---------- views ---------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs");
app.use(express.static((path.join(__dirname, "../public"))));

/* ---------- session ---------- */
app.use(sessionmiddleware);

/* ---------- passport ---------- */
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});


/* ---------- routes ---------- */
app.use("/", authRoutes);
app.use("/", adminRoutes);
app.use("/", teacherRoutes);
app.use("/students", studentRoutes);
app.use("/courses", coursesRoutes);
app.use("/enrollments", enrollmentsRoutes);
app.use("/manage", manageRoutes);

/* ---------- csrf error ---------- */
app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    return res.status(403).send("Invalid CSRF token");
  }
  next(err);
});

/* ---------- 404 ---------- */
app.use((req, res) => {
  res.status(404).send("Page not found");
});

export default app;
