import type { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { authService } from "../auth/auth.service";
const registerUser = async (req: Request, res: Response) => {
  try {
    const result = await authService.registerUserIntoDB(req.body);

    sendResponse(res, {
      statusCode: 201,
      message: "User registered successfully",
      success: true,
      data: result,
    });
  } catch (err: any) {
    sendResponse(res, {
      statusCode: 500,
      message: err.message ?? "Internal Server Error!",
      success: false,
      error: err ?? {},
    });
  }
};
const loginUser = async (req: Request, res: Response) => {
  try {
    const result = await authService.loginUserIntoDB(req.body);
    sendResponse(res, {
      statusCode: 200,
      message: "Login successful",
      success: true,
      data: result,
    });
  } catch (err: any) {
    sendResponse(res, {
      statusCode: 500,
      message: err.message ?? "Internal Server Error",
      success: false,
      error: err ?? {},
    });
  }
};
export const authController = { registerUser, loginUser };
