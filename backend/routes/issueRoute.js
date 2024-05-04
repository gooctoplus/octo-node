import express from "express";
import Issue from "../models/issueModel";
import { isAuth } from "../util";

const router = express.Router();
router.use(isAuth);

// fetch all issues from database
router.get("/", async (req, res) => {
  const { orgId } = req.decoded;
  try {
    const issues = await Issue.find({ orgId });
    console.log("fetched all issues", issues);
    res.status(201).send(issues);
  } catch (e) {
    console.log("Error in fetching all issues", e);
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
    const issue = await Issue.findOne({ orgId, issueId });
    if (issue) {
      console.log("Fetched Issue", issue);
      res.status(201).send(issue);
    } else {
      res.status(404).send({ message: "Issue not found" });
    }
  } catch (e) {
    console.log("Error in fecthing issue", e);
    res
      .status(500)
      .send({ message: "Internal Server Error", error: error.message });
  }
});

export default router;
