import type { ROLES } from "../types";
import type { Request, Response, NextFunction } from "express";
import sendResponse from "../utils/sendResponse";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";

const auth = (...roles: ROLES[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { authorization: token } = req.headers;
      if (!token) {
        sendResponse(res, {
          statusCode: 401,
          message: "Unauthorized",
          success: false,
        });
      }
      const decoded = jwt.verify(
        token as string,
        config.secret as string,
      ) as JwtPayload;

      const userData = await pool.query(`SELECT * FROM users WHERE id=$1`, [
        decoded.id,
      ]);

      if (!userData.rows[0]) {
        sendResponse(res, {
          statusCode: 404,
          message: "User Not Found",
          success: false,
        });
      }
      const user = userData.rows[0];
      req.user = user;

      if (roles.length && !roles.includes(user.role)) {
        sendResponse(res, {
          statusCode: 403,
          message: "Forbidden Access",
          success: false,
        });
      }
      req.role = user.role;

      next();
    } catch (err: any) {
      next(err);
    }
  };
};

export default auth;
