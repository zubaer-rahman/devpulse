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

const updateIssueInDB = async (
  id: number,
  payload: Partial<IIssue>,
  user: { id: number; role: string },
) => {
  const existingResult = await pool.query(`SELECT * FROM issues WHERE id=$1`, [id]);
  const issue = existingResult.rows[0];

  if (!issue) {
    return { status: 404, message: "Issue not found" };
  }

  if (user.role === "contributor") {
    if (issue.reporter_id !== user.id) {
      return { status: 403, message: "Forbidden Access" };
    }
    if (issue.status !== "open") {
      return { status: 403, message: "Forbidden Access" };
    }
  }

  const { title, description, type } = payload;
  const updatedTitle = title !== undefined ? title : issue.title;
  const updatedDescription = description !== undefined ? description : issue.description;
  const updatedType = type !== undefined ? type : issue.type;

  const result = await pool.query(
    `UPDATE issues 
     SET title=$1, description=$2, type=$3, updated_at=NOW() 
     WHERE id=$4 
     RETURNING *`,
    [updatedTitle, updatedDescription, updatedType, id],
  );

  return { status: 200, data: result.rows[0] };
};

const deleteIssueFromDB = async (id: number) => {
  const existingResult = await pool.query(`SELECT * FROM issues WHERE id=$1`, [id]);
  if (!existingResult.rows[0]) {
    return false;
  }

  await pool.query(`DELETE FROM issues WHERE id=$1`, [id]);
  return true;
};

export const issueService = {
  createIssueIntoDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
  updateIssueInDB,
  deleteIssueFromDB,
};
