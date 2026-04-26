import { pool } from "../../database/db.js";

export const insertAuth = async (authCredentials, connection = pool) => {
  const { name, email, password, role = "student" } = authCredentials;

  const [result] = await connection.query(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    [name, email, password, role]
  );

  return result;
};
