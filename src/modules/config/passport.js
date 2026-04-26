import passport from "passport";
import { Strategy } from "passport-local";
import bcrypt from "bcrypt";
import { pool } from "../../database/db.js";

passport.use(
  "local",
  new Strategy({ usernameField: 'email' }, async (email, password, cb) => {
    try {
      // 1. Try direct email match
      let [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      let user = rows.length > 0 ? rows[0] : null;

      if (!user) {
        // 2. Try phone@srms.edu format (student login uses phone number as username)
        const phoneEmail = `${String(email).trim()}@srms.edu`;
        const [phoneRows] = await pool.query('SELECT * FROM users WHERE email = ?', [phoneEmail]);
        if (phoneRows.length > 0) {
          user = phoneRows[0];
        }
      }

      if (!user) {
        // 3. Try raw phone_no in students table as last resort
        const [studentRows] = await pool.query('SELECT user_id FROM students WHERE phone_no = ?', [email]);
        if (studentRows.length > 0) {
          const [userRows] = await pool.query('SELECT * FROM users WHERE user_id = ?', [studentRows[0].user_id]);
          if (userRows.length > 0) {
            user = userRows[0];
          }
        }
      }

      if (!user) {
        return cb(null, false, { message: 'User not found' });
      }

      let match = false;
      if (user.password.startsWith('$2b$')) {
        match = await bcrypt.compare(password, user.password);
      } else {
        match = (password === user.password);
      }
      if (!match) {
        return cb(null, false, { message: 'Incorrect password' });
      }
      return cb(null, user);
    } catch (err) {
      return cb(err);
    }
  })
);

passport.serializeUser((user, cb) => {
  cb(null, { user_id: user.user_id, role: user.role });
});

passport.deserializeUser(async (payload, cb) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE user_id = ?', [payload.user_id]);
    if (rows.length === 0) {
      return cb(null, false);
    }
    return cb(null, rows[0]);
  } catch (err) {
    return cb(err);
  }
});
