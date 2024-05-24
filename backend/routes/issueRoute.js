import express from "express";
import Issue from "../models/issueModel";

const router = express.Router();

// fetch all issues from database
router.get("/", async (req, res) => {
  try {
    const issues = await Issue.find({});
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
  try {
    const { issueId } = req.params;
    const issue = await Issue.findOne({ issueId });
    console.log("Fetched Issue", issue);
    res.status(201).send(issue);
  } catch (e) {
    console.log("Error in fecthing issue", e);
    res
      .status(500)
      .send({ message: "Internal Server Error", error: error.message });
  }
});

export default router;
