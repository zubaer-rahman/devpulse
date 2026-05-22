import { Router } from "express";
const router = Router();
import { issueController } from "./issue.controller";
import auth from "../../middleware/auth";
import { USER_ROLES } from "../../types";

router.post(
  "/",
  auth(USER_ROLES.contributor, USER_ROLES.maintainer),
  issueController.createIssue,
);

router.get("/", issueController.getAllIssues);

export const issueRoute = router;
