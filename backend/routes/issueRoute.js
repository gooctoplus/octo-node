import express from "express";
import Issue from "../models/issueModel";
import { isAuth } from "../util";

const router = express.Router();
router.use(isAuth);

// fetch all issues from database with pagination
router.get("/", async (req, res) => {
  const { orgId } = req.decoded;
  // Extract limit and offset from query parameters and convert them to integers
  const limit = parseInt(req.query.limit, 10) || 10; // Default limit is 10
  const offset = parseInt(req.query.offset, 10) || 0; // Default offset is 0

  try {
    // Apply limit and offset in the mongoose query
    const issues = await Issue.find({ orgId })
                              .populate('project')
                              .limit(limit)
                              .skip(offset);
    console.log("fetched paginated issues with project details", issues);
    res.status(201).send(issues);
  } catch (error) {
    console.error("Error in fetching paginated issues", error);
    res
      .status(500)
      .send({ message: "Internal Server Error", error: error.message });
  }
});

// fetch issue by issue id from database
router.get("/:issueId", async (req, res) => {
  const { orgId } = req.decoded;
  const { issueId } = req.params;
  try {
    const issue = await Issue.findOne({ orgId, issueId: issueId }).populate('project');
    if (issue) {
      console.log("Fetched Issue with project details", { orgId, issueId, issue });
      res.status(201).send(issue);
    } else {
      console.log("Issue not found", { orgId, issueId });
      res.status(404).send({ message: "Issue not found" });
    }
  } catch (error) {
    console.error("Error in fetching issue", error);
    res
      .status(500)
      .send({ message: "Internal Server Error", error: error.message });
  }
});

export default router;