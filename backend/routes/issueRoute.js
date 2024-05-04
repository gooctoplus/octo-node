import express from "express";
import Issue from "../models/issueModel";

const router = express.Router();

// Updated fetch all issues endpoint with pagination
router.get("/", async (req, res) => {
  try {
    // Default values for pagination
    const limit = parseInt(req.query.limit, 10) || 10; // Default limit to 10 documents
    const offset = parseInt(req.query.offset, 10) || 0; // Default offset to 0

    // Fetch issues with limit and offset for pagination
    const issues = await Issue.find({}).limit(limit).skip(offset);
    console.log("Fetched issues with pagination", issues);

    // Sending paginated issues
    res.status(200).send(issues);
  } catch (error) {
    console.log("Error in fetching issues with pagination", error);
    res.status(500).send({ message: "Internal Server Error", error: error.message });
  }
});

// fetch issue by issue id from database
router.get("/:issueId", async (req, res) => {
  try {
    const { issueId } = req.params;
    const issue = await Issue.findOne({ issueId });
    console.log("Fetched Issue", issue);
    res.status(201).send(issue);
  } catch (error) {
    console.log("Error in fetching issue", error);
    res.status(500).send({ message: "Internal Server Error", error: error.message });
  }
});

export default router;