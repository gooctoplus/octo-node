require('dotenv').config();
const { Octokit } = require("@octokit/core");

const octokit = new Octokit({ auth: `token ${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}` });

async function createCommentOnPrComment(pullRequestId, parentCommentId, commentText, owner, repo) {
    try {
        console.log(`Attempting to comment on PR: PR ID=${pullRequestId}, Parent Comment ID=${parentCommentId}`);
        // Instead of commenting directly on a PR comment (as GitHub's API does not support this directly),
        // we post a comment to the PR itself, optionally referencing the parent comment.
        const commentBody = `Replying to @${parentCommentId}: \n${commentText}`;
        const response = await octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/comments', {
            owner,
            repo,
            issue_number: pullRequestId,
            body: commentBody
        });

        console.log(`Successfully commented on PR. Comment URL: ${response.data.html_url}`);
        return { url: response.data.html_url, id: response.data.id };
    } catch (error) {
        console.error(`Error commenting on PR: ${error.message}`, error);
        throw error;
    }
}

module.exports = { createCommentOnPrComment };