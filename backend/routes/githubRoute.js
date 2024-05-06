import express from 'express';
import Project from '../models/projectModel';
import { spawn } from 'child_process';
import Org from '../models/orgModel';
import { Octokit } from "@octokit/rest";

const router = express.Router();
const octokit = new Octokit({ auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN }); // Use environment variable for the token

async function handleCommitCommentWebhook(payload,res) {
    
    let repoName = payload?.repository?.name;
    const projects = await Project.findOne({ 'repos.key': repoName });
    if (projects) { 
      const {orgId} = projects;
      const org = await Org.findOne({orgId});
      const {pineconeAPIKey, openAIKey } = org;
      const currentRepo = projects.repos.find(repo => repo.key === repoName);
      if (!currentRepo) {
        console.log(`Repository with name ${repoName} not found in projects`);
        return res.status(404).send('Repository not found');
      }
      
      const repoUrl = currentRepo.url;
      const repoTargetPath = currentRepo.repoTargetPath;
      const pineconeIndex = currentRepo.pineconeIndex;
    const {body, path, diff_hunk} = payload?.comment;
    const {name} = payload?.repository;
    const {ref} = payload?.pull_request?.head;
    const pattern = /@useocto/i;
    
    if (pattern.test(body)) {
        let responseBody = {
            commentText: body,
            filePath: path,
            repoName: name,
            diff_hunk: diff_hunk,
            working_branch: ref,
        };
        const pythonProcess = spawn('/app/octoplus/bin/python', ['/app/octoplus/octo/main.py',`--working_branch=${ref}`, `--diff_hunk=${diff_hunk}`, `--is-git-flow=True`, `--comment-text=${body}`,  `--comment-file=${path}`,`--pineconeAPIKey=${pineconeAPIKey}`, `--openAIKey=${openAIKey}`, `--pineconeIndex=${pineconeIndex}`, `--repoUrl=${repoUrl}`, `--repoTargetPath=${repoTargetPath}`], {
            cwd: '/app/octoplus/octo/'
        });
        pythonProcess.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });
  
        pythonProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });
  
        pythonProcess.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
            res.send('Python script executed');
        });
    } else {
        console.log('org not found')
        res.status(404).send('Org not found');
      }
    }
}

router.post('/webhook', async (req, res) => {
    try{
        const payload = req.body;
        console.log("inside my route");
        handleCommitCommentWebhook(payload,res)
        res.status(200).send('Webhook received');
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// New API endpoint to comment on a comment within a GitHub pull request
router.post('/comment-on-comment', async (req, res) => {
  console.log("Attempting to post a comment on a GitHub pull request comment");
  const { pullRequestId, parentCommentId, commentText, repoOwner, repoName } = req.body;

  if (!pullRequestId || !parentCommentId || !commentText || !repoOwner || !repoName) {
    console.log("Missing required parameters for posting a comment on a GitHub pull request comment");
    return res.status(400).json({ message: 'Missing required parameters.' });
  }

  try {
    const response = await octokit.rest.pulls.createReplyForReviewComment({
      owner: repoOwner,
      repo: repoName,
      pull_number: pullRequestId,
      comment_id: parentCommentId,
      body: commentText,
    });

    console.log("Comment posted successfully on GitHub");
    res.json({ message: 'Comment posted successfully', data: response.data });
  } catch (error) {
    console.error('Error posting comment on GitHub:', error);
    if (error.status === 403 || error.status === 401) {
      res.status(error.status).json({ message: 'Unauthorized: Invalid token or insufficient permissions.' });
    } else if (error.status === 404) {
      res.status(404).json({ message: 'Pull request or comment not found.' });
    } else {
      res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
  }
});

export default router;