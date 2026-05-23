import type { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { issueService } from "./issue.service";

const createIssue = async (req: Request, res: Response) => {
  try {
    const {id} = req.user
    const result = await issueService.createIssueIntoDB(req.body, id);
    sendResponse(res, {
      statusCode: 201,
      message: "Issue Created Succesfully",
      success: true,
      data: result ?? {},
    });
  } catch (err: any) {
    sendResponse(res, {
      statusCode: 500,
      message: "Internal Server Error",
      success: false,
      error: err ?? {},
    });
  }
};

const getAllIssues = async (req: Request, res: Response) => {
  try {
    const result = await issueService.getAllIssuesFromDB(req.query);
    sendResponse(res, {
      statusCode: 200,
      message: "Issues retrived successfully",
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

const getSingleIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await issueService.getSingleIssueFromDB(Number(id));
    if (!result) {
      sendResponse(res, {
        statusCode: 404,
        message: "Issue not found",
        success: false,
      });
      return;
    }
    sendResponse(res, {
      statusCode: 200,
      message: "Issue retrived successfully",
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

const updateIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const result = await issueService.updateIssueInDB(Number(id), req.body, {
      id: user.id,
      role: user.role,
    });

    if (result.status === 404) {
      sendResponse(res, {
        statusCode: 404,
        message: result.message || "Issue not found",
        success: false,
      });
      return;
    }

    if (result.status === 403) {
      sendResponse(res, {
        statusCode: 403,
        message: result.message || "Forbidden Access",
        success: false,
      });
      return;
    }

    sendResponse(res, {
      statusCode: 200,
      message: "Issue updated successfully",
      success: true,
      data: result.data,
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

const deleteIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await issueService.deleteIssueFromDB(Number(id));

    if (!deleted) {
      sendResponse(res, {
        statusCode: 404,
        message: "Issue not found",
        success: false,
      });
      return;
    }

    sendResponse(res, {
      statusCode: 200,
      message: "Issue deleted successfully",
      success: true,
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

export const issueController = { createIssue, getAllIssues, getSingleIssue, updateIssue, deleteIssue };
