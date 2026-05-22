import type { IUser } from "../user/user.interface";
import { pool } from "../../db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../../config";

const registerUserIntoDB = async (payload: IUser) => {
  const { name, email, password, role } = payload;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await pool.query(
    `INSERT INTO users(name,email,password,role) VALUES($1,$2,$3, COALESCE($4, 'contributor')) RETURNING *`,
    [name, email, hashedPassword, role],
  );
  delete user.rows[0].password;
  return user.rows[0];
};
const loginUserIntoDB = async (payload: Pick<IUser, "email" | "password">) => {
  const { email, password } = payload;
  const userData = await pool.query(`SELECT * FROM users WHERE email=$1`, [
    email,
  ]);

  if (!userData.rows[0]) throw new Error("User not Exist");

  const user = userData.rows[0];
  const matchPassword = await bcrypt.compare(password, user.password);

  if (!matchPassword) throw new Error("Invalid credentials");

  const jwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role,
  };

  const token = jwt.sign(jwtPayload, config.secret as string, {
    expiresIn: "1d",
  });
  delete user.password;
  return {
    user,
    token,
  };
};
export const authService = {
  registerUserIntoDB,
  loginUserIntoDB,
};
