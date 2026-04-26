import { pool } from "../../database/db.js";

export const showEnrollmentForm = async (req, res) => {
  try {
    const [courses] = await pool.query('SELECT course_id, course_name FROM courses ORDER BY course_name');
    
    // Fetch courses this student is already enrolled in
    const [studentRows] = await pool.query('SELECT student_id FROM students WHERE user_id = ?', [req.user.user_id]);
    let enrolledIds = [];
    if (studentRows.length > 0) {
      const [enrolled] = await pool.query(
        'SELECT course_id FROM enrollments WHERE student_id = ?',
        [studentRows[0].student_id]
      );
      enrolledIds = enrolled.map(r => r.course_id);
    }

    res.render("app/enrollment", { courses, enrolledIds, message: req.query.message || null });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching courses");
  }
};


export const enrollStudent = async (req, res) => {
  const { course_id } = req.body;
  const user_id = req.user.user_id;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [studentRows] = await connection.query('SELECT student_id FROM students WHERE user_id = ?', [user_id]);
    if(studentRows.length === 0) {
      return res.status(403).send("Student not found");
    }
    const student_id = studentRows[0].student_id;

    // Check for duplicate enrollment
    const [existing] = await connection.query(
      'SELECT enrollment_id FROM enrollments WHERE student_id = ? AND course_id = ?',
      [student_id, course_id]
    );
    if (existing.length > 0) {
      await connection.rollback();
      return res.redirect("/enrollments/enroll?message=You+are+already+enrolled+in+this+course");
    }

    await connection.query('INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)', [student_id, course_id]);

    await connection.commit();
    res.redirect("/enrollments/enroll?message=Successfully+enrolled");
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.redirect("/enrollments/enroll?message=Enrollment+failed");
  } finally {
    connection.release();
  }
};

