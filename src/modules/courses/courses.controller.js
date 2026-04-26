import { pool } from "../../database/db.js";

export const showAddCourse = (req, res) => {
  res.render("app/addCourse");
};

export const addCourse = async (req, res) => {
  const { course_name } = req.body;
  const user_id = req.user.user_id;

  try {
    const [teacherRows] = await pool.query('SELECT teacher_id FROM teachers WHERE user_id = ?', [user_id]);
    if(teacherRows.length === 0) {
      return res.status(403).send("Teacher not found");
    }
    const teacher_id = teacherRows[0].teacher_id;

    await pool.query('INSERT INTO courses (course_name, teacher_id) VALUES (?, ?)', [course_name, teacher_id]);
    res.redirect("/courses/listCourses?message=Course+added");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding course");
  }
};

export const listCourses = async (req, res) => {
  try {
    const [courses] = await pool.query(`
      SELECT c.course_id, c.course_name, u.name as teacher_name,
             COUNT(e.student_id) AS enrolled_count
      FROM courses c 
      JOIN teachers t ON c.teacher_id = t.teacher_id 
      JOIN users u ON t.user_id = u.user_id
      LEFT JOIN enrollments e ON c.course_id = e.course_id
      GROUP BY c.course_id, c.course_name, u.name
      ORDER BY c.course_id DESC
    `);
    res.render("app/listCourses", { courses });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching courses");
  }
};

