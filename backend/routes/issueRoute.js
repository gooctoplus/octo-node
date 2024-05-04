import express from "express";
import Issue from "../models/issueModel";

const router = express.Router();

// Updated fetch all issues endpoint with pagination and validation
router.get("/", async (req, res) => {
  let { limit, offset } = req.query;

  // Set default values if not provided and validation
  limit = limit ? parseInt(limit, 10) : 10;
  offset = offset ? parseInt(offset, 10) : 0;

  // Validate 'limit' and 'offset' to be integers
  if (isNaN(limit) || isNaN(offset)) {
    console.log("Invalid query parameters: Limit and offset must be valid integers");
    return res.status(400).send({ message: "Limit and offset must be valid integers" });
  }

  try {
    // Fetch issues with limit and offset for pagination
    const issues = await Issue.find({}).limit(limit).skip(offset);
    console.log("Fetched issues with pagination", issues);

    // Sending paginated issues
    res.status(200).send(issues);
  } catch (error) {
    console.error("Error in fetching issues with pagination", error);
    res.status(500).send({ message: "Internal Server Error", error: error.message });
  }
});

// fetch issue by issue id from database
router.get("/:issueId", async (req, res) => {
  try {
    const { issueId } = req.params;
    const issue = await Issue.findOne({ issueId });
    console.log("Fetched Issue", issue);
    if (issue) {
      res.status(200).send(issue);
    } else {
      console.log(`Issue with ID ${issueId} not found`);
      res.status(404).send({ message: `Issue with ID ${issueId} not found` });
    }
  } catch (error) {
    console.error("Error in fetching issue", error);
    res.status(500).send({ message: "Internal Server Error", error: error.message });
  }
});

export default router;