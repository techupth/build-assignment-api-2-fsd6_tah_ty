import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

app.use(express.json());

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.get("/assignments", async (req, res) => {
  try {
    const results = await connectionPool.query(`SELECT * FROM assignments`);
    return res.status(200).json({
      data: results.rows,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }
});

app.get("/assignments/:assignmentId", async (req, res) => {
  const assignmentIdFromClient = req.params.assignmentId;
  try {
    const results = await connectionPool.query(
      `SELECT * FROM assignments WHERE assignment_id=$1`,
      [assignmentIdFromClient]
    );
    if (results.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Server could not find a requested assignment" });
    }
    return res.status(200).json({
      data: results.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }
});

app.put("/assignments/:assignmentId", async (req, res) => {
  const assignmentIdFromClient = req.params.assignmentId;
  const updatedAssignment = { ...req.body, updated_at: new Date() };
  try {
    const checkResult = await connectionPool.query(
      `SELECT * FROM assignments WHERE assignment_id = $1`,
      [assignmentIdFromClient]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        message: "Server could not find a requested assignment to update",
      });
    }
    await connectionPool.query(
      `update assignments
        set 
        title=$2,
        content=$3,
        category =$4,
        updated_at=$5
        where assignment_id = $1
    `,
      [
        assignmentIdFromClient,
        updatedAssignment.title,
        updatedAssignment.content,
        updatedAssignment.category,
        updatedAssignment.updated_at,
      ]
    );

    return res.status(200).json({
      message: "Updated assignment sucessfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server could not update assignment because database connection",
    });
  }
});

app.delete("/assignments/:assignmentId", async (req, res) => {
  const assignmentIdFromClient = req.params.assignmentId;
  try {
    const results = await connectionPool.query(
      `SELECT * FROM assignments WHERE assignment_id =$1`,
      [assignmentIdFromClient]
    );
    if (results.rows.length === 0) {
      return res.status(404).json({
        message: "Server could not find a requested assignment to delete",
      });
    }
    await connectionPool.query(
      `DELETE FROM assignments 
    WHERE assignment_id=$1`,
      [assignmentIdFromClient]
    );
    return res.status(200).json({
      message: "Deleted assignment sucessfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server could not delete assignment because database connection",
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
