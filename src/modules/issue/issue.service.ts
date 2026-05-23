import { pool } from "../../db";
import type { IIssue } from "./issue.interface";

const createIssueIntoDB = async (payload: IIssue, reporter_id: number) => {
  const { title, description, type } = payload;
  const result = await pool.query(
    `INSERT INTO issues(title,description,type,reporter_id) VALUES($1,$2,$3,$4) RETURNING *`,
    [title, description, type, reporter_id],
  );
  return result.rows[0];
};

const getAllIssuesFromDB = async (query: { sort?: string; type?: string; status?: string }) => {
  const { sort, type, status } = query;

  let queryText = `SELECT * FROM issues`;
  const queryParams: any[] = [];
  const filters: string[] = [];

  if (type) {
    queryParams.push(type);
    filters.push(`type = $${queryParams.length}`);
  }

  if (status) {
    queryParams.push(status);
    filters.push(`status = $${queryParams.length}`);
  }

  if (filters.length > 0) {
    queryText += ` WHERE ` + filters.join(" AND ");
  }

  if (sort === "oldest") {
    queryText += ` ORDER BY created_at ASC`;
  } else {
    queryText += ` ORDER BY created_at DESC`;
  }

  const result = await pool.query(queryText, queryParams);
  const issues = result.rows;

  if (issues.length === 0) {
    return [];
  }

  const reporterIds = Array.from(
    new Set(issues.map((issue) => issue.reporter_id).filter(Boolean)),
  );

  if (reporterIds.length > 0) {
    const placeholders = reporterIds.map((_, index) => `$${index + 1}`).join(", ");
    const usersResult = await pool.query(
      `SELECT id, name, role FROM users WHERE id IN (${placeholders})`,
      reporterIds,
    );

    const reportersMap = new Map(usersResult.rows.map((user) => [user.id, user]));

    return issues.map((issue) => {
      const reporter = reportersMap.get(issue.reporter_id) || null;
      const { reporter_id, ...issueData } = issue;
      return {
        ...issueData,
        reporter,
      };
    });
  }

  return issues.map((issue) => {
    const { reporter_id, ...issueData } = issue;
    return {
      ...issueData,
      reporter: null,
    };
  });
};

const getSingleIssueFromDB = async (id: number) => {
  const result = await pool.query(`SELECT * FROM issues WHERE id=$1`, [id]);
  const issue = result.rows[0];

  if (!issue) {
    return null;
  }

  if (issue.reporter_id) {
    const userResult = await pool.query(`SELECT id, name, role FROM users WHERE id=$1`, [
      issue.reporter_id,
    ]);
    const reporter = userResult.rows[0] || null;
    const { reporter_id, ...issueData } = issue;
    return {
      ...issueData,
      reporter,
    };
  }

  const { reporter_id, ...issueData } = issue;
  return {
    ...issueData,
    reporter: null,
  };
};

export const issueService = { createIssueIntoDB, getAllIssuesFromDB, getSingleIssueFromDB };
