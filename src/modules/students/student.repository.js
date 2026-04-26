import { pool } from "../../database/db.js";

/* -------------------- HELPERS -------------------- */
const toNumberOrNull = (value) => {
  if (value === undefined || value === null || value === "") return null;

  const num = Number(value);
  if (Number.isNaN(num)) return null;

  return num;
};


/* -------------------- SEARCH -------------------- */
export const search = async (id) => {
  try {
    const numericId = Number(id);
    const isNumber = !Number.isNaN(numericId);

    const [rows] = await pool.query(
      `
      SELECT s.*, u.name AS user_name, u.email
      FROM students s
      LEFT JOIN users u ON s.user_id = u.user_id
      WHERE s.roll_number = ? OR s.student_id = ?
      LIMIT 1
      `,
      [id, isNumber ? numericId : -1]
    );

    return rows[0] || null;
  } catch (err) {
    console.error("SEARCH ERROR:", err);
    throw err;
  }
};


/* -------------------- INSERT -------------------- */
export const insert = async (data, connection = pool) => {
  try {
    if (!data) throw new Error("No data provided");

    const {
      user_id = null,
      id,          // roll_number
      name,
      age,
      branch,
      year,
      phone,
      cgpa
    } = data;

    // ✅ Required fields
    if (!id || !name || !branch || !phone) {
      throw new Error("Missing required fields (id, name, branch, phone)");
    }

    const parsedAge = toNumberOrNull(age);
    const parsedYear = toNumberOrNull(year);
    const parsedCgpa = toNumberOrNull(cgpa);

    // ✅ Strict validation (no silent damage)
    if (parsedAge !== null && (!Number.isInteger(parsedAge) || parsedAge < 0)) {
      throw new Error("Invalid age");
    }

    if (parsedYear !== null && (!Number.isInteger(parsedYear) || parsedYear < 1 || parsedYear > 4)) {
      throw new Error("Invalid year");
    }

    if (parsedCgpa !== null && (parsedCgpa < 0 || parsedCgpa > 10)) {
      throw new Error("Invalid CGPA");
    }

    const [result] = await connection.query(
      `
      INSERT INTO students 
      (user_id, roll_number, name, age, branch, current_year, phone_no, cgpa)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        user_id,
        id,
        name,
        parsedAge,
        branch,
        parsedYear,
        phone,
        parsedCgpa
      ]
    );

    return result;

  } catch (err) {
    console.error("INSERT ERROR:", err.sqlMessage || err.message);
    throw err;
  }
};


/* -------------------- GET ALL -------------------- */
export const getdata = async () => {
  try {
    const [rows] = await pool.query(`
      SELECT s.*, u.name AS user_name, u.email
      FROM students s
      LEFT JOIN users u ON s.user_id = u.user_id
      ORDER BY s.student_id DESC
    `);

    return rows;
  } catch (err) {
    console.error("GET DATA ERROR:", err);
    throw err;
  }
};


/* -------------------- DELETE -------------------- */
export const deleteId = async (id) => {
  try {
    const numericId = Number(id);
    const isNumber = !Number.isNaN(numericId);

    const [result] = await pool.query(
      `
      DELETE FROM students 
      WHERE roll_number = ? OR student_id = ?
      `,
      [id, isNumber ? numericId : -1]
    );

    return result;
  } catch (err) {
    console.error("DELETE ERROR:", err);
    throw err;
  }
};