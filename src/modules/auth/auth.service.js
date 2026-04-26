import * as repository from "./auth.repository.js";
import bcrypt from "bcrypt";

export const createCredentials = async ({ name, phone, id, role = "student" }, connection) => {
  const email = `${String(id).toLowerCase()}@srms.edu`;
  const password = await bcrypt.hash(String(phone), 10);

  return repository.insertAuth(
    {
    name,
    email,
    password,
      role,
    },
    connection
  );
};
