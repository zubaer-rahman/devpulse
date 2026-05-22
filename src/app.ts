import express from "express";
import { type Request, type Response, type Application } from "express";

export const app: Application = express();
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});
