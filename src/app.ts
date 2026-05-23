import express from "express";
import { type Request, type Response, type Application } from "express";
import { authRoute } from "./modules/auth/auth.route";
import { issueRoute } from "./modules/issue/issue.route";

import cors from "cors";
import config from "./config";
import globalErrorHandler from "./middleware/globalErrorHandler";

export const app: Application = express();

app.use(express.json());
app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.use("/api/auth", authRoute);
app.use("/api/issues", issueRoute);

app.use(globalErrorHandler);
