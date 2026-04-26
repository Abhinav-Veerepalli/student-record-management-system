import { pool } from "../../database/db.js";
import bcrypt from "bcrypt";

export const renderhome = async (req, res) => {
    if (req.user.user_id != req.params.id && req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).send("not your profile");
    }
    try {
      const [rows] = await pool.query(`
        SELECT s.*, COALESCE(s.name, u.name) AS resolved_name, u.email,
               GROUP_CONCAT(c.course_name ORDER BY c.course_name SEPARATOR ', ') AS enrolled_courses
        FROM students s 
        JOIN users u ON s.user_id = u.user_id
        LEFT JOIN enrollments e ON s.student_id = e.student_id
        LEFT JOIN courses c ON e.course_id = c.course_id
        WHERE u.user_id = ?
        GROUP BY s.student_id
      `, [req.params.id]);
      
      if (!rows[0]) return res.status(404).send("Student profile not found");
      const rawStudent = rows[0];
      const mappedStudent = {
         name: rawStudent.resolved_name,
         email: rawStudent.email,
         id: rawStudent.roll_number || rawStudent.student_id,
         age: rawStudent.age,
         phone: rawStudent.phone_no,
         branch: rawStudent.branch,
         year: rawStudent.current_year,
         cgpa: rawStudent.cgpa,
         courses: rawStudent.enrolled_courses || null
      };
      res.render("home/studenthome", { student: mappedStudent });
    } catch (err) {
      console.error(err);
      res.status(500).send("Error fetching profile");
    }
}

export const addStudent = (req, res) => {
     res.render('app/add', {
      csrfToken: req.csrfToken && req.csrfToken() || '',
    });
}

export const searchStudent = (req, res) => {
    res.render('app/search', {
      student: null,
      message: req.query.message || null,
      csrfToken: req.csrfToken && req.csrfToken() || ''
    });
}

export const editStudent = async (req, res) => {
    const student_id = req.params.id;
    try {
        let query = `
          SELECT s.*, COALESCE(s.name, u.name) AS resolved_name, u.email
          FROM students s
          LEFT JOIN users u ON s.user_id = u.user_id
          WHERE s.roll_number = ?`;
        let params = [student_id];
        if (!isNaN(student_id)) {
            query += ` OR s.student_id = ?`;
            params.push(Number(student_id));
        }

        const [rows] = await pool.query(query, params);
        if (rows.length === 0) return res.redirect('/students/displayStudents?message=Not_Found');
        
        const rawStd = rows[0];
        const student = {
            id: rawStd.roll_number || rawStd.student_id,
            name: rawStd.resolved_name || '',
            age: rawStd.age,
            branch: rawStd.branch,
            year: rawStd.current_year,
            phone: rawStd.phone_no,
            cgpa: rawStd.cgpa
        };

        res.render('app/edit', {
            student,
            csrfToken: req.csrfToken && req.csrfToken() || ''
        });
    } catch (err) {
        console.error(err);
        res.redirect('/students/displayStudents?message=Error');
    }
}

export const postEditStudent = async (req, res) => {
    const student_id = req.params.id;
    const { name, age, branch, year, phone, cgpa } = req.body;
    
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Update student data
        let updateQuery = `UPDATE students SET name = ?, age = ?, branch = ?, current_year = ?, phone_no = ?, cgpa = ? WHERE roll_number = ?`;
        let updateParams = [name, parseInt(age), branch, parseInt(year), phone, parseFloat(cgpa), student_id];
        if (!isNaN(student_id)) {
            updateQuery += ` OR student_id = ?`;
            updateParams.push(student_id);
        }
        await connection.query(updateQuery, updateParams);

        // 2. Fetch student's user_id to correctly update the users table
        let selectQuery = `SELECT user_id FROM students WHERE roll_number = ?`;
        let selectParams = [student_id];
        if (!isNaN(student_id)) {
            selectQuery += ` OR student_id = ?`;
            selectParams.push(student_id);
        }
        const [studentRows] = await connection.query(selectQuery, selectParams);
        
        if (studentRows.length > 0 && studentRows[0].user_id) {
            // Update name in users table to keep it synchronized!
            // When phone_no changes in students table, the username is automatically updated as per our previous login logic.
            await connection.query(
                `UPDATE users SET name = ? WHERE user_id = ?`,
                [name, studentRows[0].user_id]
            );
        }

        await connection.commit();
        res.redirect('/students/displayStudents?message=Student_Updated_Successfully');
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.redirect('/students/displayStudents?message=Update_Failed');
    } finally {
        connection.release();
    }
}

export const deleteStudent = (req, res) => {
    const message = req.query.message;
    res.render('app/delete', {
      student: null,
      message: message || null,
      csrfToken: req.csrfToken && req.csrfToken() || ''
    });
}

export const displayStudents = async (req, res) => {
    try {
      const [students] = await pool.query(`
        SELECT s.*, 
               COALESCE(s.name, u.name) AS resolved_name,
               u.email, 
               GROUP_CONCAT(c.course_name ORDER BY c.course_name SEPARATOR ', ') AS enrolled_courses 
        FROM students s 
        LEFT JOIN users u ON s.user_id = u.user_id
        LEFT JOIN enrollments e ON s.student_id = e.student_id
        LEFT JOIN courses c ON e.course_id = c.course_id
        GROUP BY s.student_id
        ORDER BY s.student_id DESC
      `);
      const mapped = students.map(s => ({
         name: s.resolved_name || 'Unknown',
         id: s.roll_number || s.student_id,
         age: s.age || 'N/A',
         phone: s.phone_no || 'N/A',
         branch: s.branch || 'N/A',
         year: s.current_year || 'N/A',
         cgpa: s.cgpa != null ? s.cgpa : 'N/A',
         courses: s.enrolled_courses || 'Not Enrolled'
      }));
      res.render('app/display.ejs', { students: mapped });
    } catch (err) {
      console.error(err);
      res.status(500).send("Error fetching data");
    }
}

export const postaddstudent = async (req, res, next) => {
    const { id, name, age, branch, year, phone, cgpa } = req.body;
    
    if (!id || !name || !phone) {
        return res.status(400).json({ message: 'Student ID, name, and phone are required.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Auto-generate login: phone number as username (email), roll_number (id) as password
        const email = `${String(phone).trim()}@srms.edu`;
        const defaultPassword = String(id).trim(); // Roll number is the password
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        // Insert into users table first
        const [userResult] = await connection.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, 'student']
        );
        const userId = userResult.insertId;

        // Insert into students table with the linked user_id
        const yearInt = parseInt(year) || null;
        await connection.query(
            'INSERT INTO students (user_id, roll_number, name, age, branch, current_year, phone_no, cgpa) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [userId, id, name, parseInt(age) || null, branch, yearInt, String(phone).trim(), parseFloat(cgpa) || null]
        );
        
        await connection.commit();
        res.json({ success: true, message: `Student added! Login: ${String(phone).trim()}@srms.edu | Password: ${String(id).trim()}` });
    } catch (err) {
        await connection.rollback();
        console.error(err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'A student with this Roll Number or Phone already exists.' });
        }
        res.status(500).json({ message: 'Database error. Please try again.' });
    } finally {
        connection.release();
    }
}

export const postSearchStudent = async (req, res, next) => {
    const { search_id } = req.body;
    try {
      const [rows] = await pool.query(`
        SELECT s.*, u.name, u.email 
        FROM students s 
        JOIN users u ON s.user_id = u.user_id 
        WHERE s.roll_number = ?
      `, [search_id]);

      const rawStd = rows[0];
      const student = rawStd ? {
         name: rawStd.name,
         email: rawStd.email,
         id: rawStd.roll_number || rawStd.student_id,
         age: rawStd.age,
         phone: rawStd.phone_no,
         branch: rawStd.branch,
         year: rawStd.current_year,
         cgpa: rawStd.cgpa
      } : null;

      if (req.body.identifier == 'true') {
        if (student) {
          return res.render('app/delete', {
            student: student,
            message: null,
            csrfToken: req.csrfToken && req.csrfToken() || ''
          });
        } else {
          res.redirect('/students/deleteStudent?message=student_not_found');
        }
      } else {
        if (student) {
          return res.render('app/search', {
            student: student,
            csrfToken: req.csrfToken && req.csrfToken() || ''
          });
        } else {
          res.redirect('/students/searchStudent?message=student_not_found');
        }
      }
    } catch (err) {
      res.status(500).send("Internal server error");
    }
}

export const postdeletestudent = async (req, res, next) => {
    const roll_number = req.params.search_id;
    try {
      const [rows] = await pool.query('SELECT user_id FROM students WHERE roll_number = ?', [roll_number]);
      if(rows.length > 0) {
        await pool.query('DELETE FROM users WHERE user_id = ?', [rows[0].user_id]); 
      }
      res.redirect('/students/deleteStudent?message=deleted');
    } catch (err) {
      console.error(err);
      res.redirect('/students/deleteStudent?message=delete_failed');
    }
}