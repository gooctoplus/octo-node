// /Users/priyal/projects/octoplus/octo/repos/octo-node/backend/routes/githubRoute.js

import express from 'express';
import { Octokit } from "@octokit/rest";

const router = express.Router();
router.use(express.json());

// Middleware for authentication and authorization
const authenticateAndAuthorizeUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      console.log("Authentication token is required.");
      return res.status(401).json({ message: "Authentication token is required." });
    }

    const octokit = new Octokit({ auth: token });

    // Verify the user has permissions to comment on the pull request
    const { repoOwner, repoName, pullRequestId } = req.body; // Extract repo details from the request body
    const { data: pullRequest } = await octokit.pulls.get({
      owner: repoOwner,
      repo: repoName,
      pull_number: pullRequestId,
    });

    if (!pullRequest) {
      console.log("Pull request not found.");
      return res.status(404).json({ message: "Pull request not found." });
    }

    // Implement any specific logic to verify if the authenticated user has the rights to comment.
    // Assume if the user can fetch the pull request, they can comment for this example.

    next(); // User is authenticated and authorized
  } catch (error) {
    console.error("Authentication or authorization error:", error);
    return res.status(500).json({ message: "Failed to authenticate or authorize user.", error: error.toString() });
  }
};

// Placeholder for the existing webhook handling functionality
// This should be replaced with the actual webhook handling code that was previously in place
router.post('/webhook', async (req, res) => {
  // Webhook handling logic here
  res.status(200).send('Webhook received and processed');
});

// New API endpoint to comment on a comment within a GitHub pull request
router.post('/comment-on-comment', authenticateAndAuthorizeUser, async (req, res) => {
  console.log("Attempting to post a comment on a GitHub pull request comment");
  const { pullRequestId, parentCommentId, commentText, repoOwner, repoName } = req.body;

  try {
    const octokit = new Octokit({ auth: req.headers.authorization.split(" ")[1] });

    // Assuming the GitHub API requires the pull request review comment endpoint for commenting on a comment
    const { data: comment } = await octokit.pulls.createReviewCommentReply({
      owner: repoOwner,
      repo: repoName,
      pull_number: pullRequestId,
      body: commentText,
      in_reply_to: parentCommentId,
    });

    res.json({ message: "Comment posted successfully", comment });
  } catch (error) {
    console.error("Error posting comment:", error);
    res.status(500).json({ message: "Failed to post comment", error: error.toString() });
  }
});

export default router;