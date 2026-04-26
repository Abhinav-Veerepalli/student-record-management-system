import passport from "passport";
import bcrypt from "bcrypt";
import { pool } from "../../database/db.js";

export const roleSelection = (req,res) => {
    res.render('auth/role');
}

export const studentLogin = (req, res) => {
  res.render('auth/studentLogin', { message: req.query.message || null });
};

export const adminLogin = (req, res) => {
  res.render('auth/adminlogin', { message: req.query.message || null });
};

export const teacherLogin = (req, res) => {
  res.render("auth/teacherlogin", { message: req.query.message || null });
};  

export const showRegisterStudent = (req, res) => {
  res.render("auth/registerStudent", { message: req.query.message || null });
};

export const showRegisterTeacher = (req, res) => {
  res.render("auth/registerTeacher", { message: req.query.message || null });
};

export const registerStudent = async (req, res, next) => {
  const { name, email, password, roll_number, age, phone_no, cgpa, current_year, branch } = req.body;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [userResult] = await connection.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'student']
    );
    const userId = userResult.insertId;

    await connection.query(
      'INSERT INTO students (user_id, roll_number, name, age, phone_no, cgpa, current_year, branch) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, roll_number, name, age || null, phone_no, cgpa || null, current_year || null, branch]
    );

    await connection.commit();
    res.redirect('/studentLogin?message=Registration%20successful');
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.redirect('/register/student?message=Registration%20failed');
  } finally {
    connection.release();
  }
};

export const registerTeacher = async (req, res, next) => {
  const { name, email, password, department } = req.body;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [userResult] = await connection.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'teacher']
    );
    const userId = userResult.insertId;

    await connection.query(
      'INSERT INTO teachers (user_id, department) VALUES (?, ?)',
      [userId, department]
    );

    await connection.commit();
    res.redirect('/teacherLogin?message=Registration%20successful');
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.redirect('/register/teacher?message=Registration%20failed');
  } finally {
    connection.release();
  }
};


export const studentLoginPost = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user || user.role !== 'student') {
      return res.redirect("/studentLogin?message=invalid_credentials");
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      res.redirect(`/students/studentHome/${user.user_id}`);
    });
  })(req, res, next);
}

export const adminLoginPost = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user || user.role !== 'admin') {
      return res.redirect("/adminLogin?message=invalid_credentials");
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      res.redirect(`/adminHome`);
    });
  })(req, res, next);
}

export const teacherLoginPost = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user || user.role !== 'teacher') {
      return res.redirect("/teacherLogin?message=invalid_credentials");
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      res.redirect(`/teacherhome`);
    });
  })(req, res, next);
}

export const logout = (req, res, next) => {
    req.logout((err) => {
    if (err) return next(err);
    res.redirect("/role");
  });
}