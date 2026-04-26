import * as repository from "./student.repository.js";
import { createCredentials } from "../auth/auth.service.js";
import { pool } from "../../database/db.js";

export const postaddstudent = async (student) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const authResult = await createCredentials(
      {
        name: student.name,
        phone: student.phone,
        id: student.id,
        role: "student",
      },
      connection
    );

    const insertResult = await repository.insert(
      {
        ...student,
        user_id: authResult.insertId,
      },
      connection
    );

    await connection.commit();
    return insertResult;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const getdata = async () => {
  return repository.getdata();
};

export const search = async (id) => {
  return repository.search(id);
};

export const deleteId = async (id) => {
  return repository.deleteId(id);
};
