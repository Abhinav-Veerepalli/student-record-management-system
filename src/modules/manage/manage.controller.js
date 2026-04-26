import { pool } from "../../database/db.js";
import bcrypt from "bcrypt";

// List all teachers
export const listTeachers = async (req, res) => {
  try {
    const [teachers] = await pool.query(`
      SELECT t.teacher_id, t.department, u.user_id, u.name, u.email 
      FROM teachers t 
      JOIN users u ON t.user_id = u.user_id
    `);
    res.render("manage/teachersList", { teachers, message: req.query.message || null });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching teachers");
  }
};

// Render edit form
export const editTeacher = async (req, res) => {
  const teacher_id = req.params.id;
  try {
    const [rows] = await pool.query(`
      SELECT t.teacher_id, t.department, u.name, u.email 
      FROM teachers t 
      JOIN users u ON t.user_id = u.user_id 
      WHERE t.teacher_id = ?
    `, [teacher_id]);

    if (rows.length === 0) {
      return res.status(404).send("Teacher not found");
    }

    res.render("manage/editTeacher", { teacher: rows[0], csrfToken: req.csrfToken() });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading teacher");
  }
};

// Handle edit submission
export const postEditTeacher = async (req, res) => {
  const teacher_id = req.params.id;
  const { name, email, department } = req.body;

  try {
    // 1. Get the underlying user_id from teachers table
    const [teacherRows] = await pool.query("SELECT user_id FROM teachers WHERE teacher_id = ?", [teacher_id]);
    if (teacherRows.length === 0) {
      return res.status(404).send("Teacher not found");
    }
    const user_id = teacherRows[0].user_id;

    // 2. Update users table (name, email)
    await pool.query("UPDATE users SET name = ?, email = ? WHERE user_id = ?", [name, email, user_id]);

    // 3. Update teachers table (department)
    await pool.query("UPDATE teachers SET department = ? WHERE teacher_id = ?", [department, teacher_id]);

    res.redirect("/manage/teachers?message=Teacher+updated+successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating teacher");
  }
};

// Render add teacher form
export const addTeacher = async (req, res) => {
  try {
    const [courses] = await pool.query("SELECT * FROM courses");
    res.render('app/addTeacher', { 
      courses,
      csrfToken: req.csrfToken && req.csrfToken() || '' 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading add teacher page");
  }
};

// Handle add teacher submission
export const postAddTeacher = async (req, res) => {
  const { id, name, email, phone, department, course_id } = req.body;
  if (!name || !email || !phone) {
    return res.status(400).json({ success: false, message: 'Name, Email and Phone are required.' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Student style: Phone as username, provided ID as password
    // If no ID provided, we can auto-generate one or use phone
    const username = `${String(phone).trim()}@srms.edu`;
    const defaultPassword = String(id || phone).trim(); 
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // 1. Insert into users
    const [userResult] = await connection.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, username, hashedPassword, 'teacher']
    );
    const userId = userResult.insertId;

    // 2. Insert into teachers
    const [teacherResult] = await connection.query(
      'INSERT INTO teachers (user_id, department) VALUES (?, ?)',
      [userId, department || null]
    );
    const teacherId = teacherResult.insertId;

    // 3. Allocate course if selected
    if (course_id) {
       await connection.query(
         'UPDATE courses SET teacher_id = ? WHERE course_id = ?',
         [teacherId, course_id]
       );
    }

    await connection.commit();
    res.json({ 
      success: true, 
      message: `Teacher added! Login: ${username} | Password: ${defaultPassword}` 
    });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'A user with this phone or email already exists.' });
    }
    res.status(500).json({ success: false, message: 'Database error. Please try again.' });
  } finally {
    connection.release();
  }
};
