import express from 'express';
import Project from '../models/projectModel';
import { spawn } from 'child_process';
import Org from '../models/orgModel';
import { Octokit } from "@octokit/core";
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const octokit = new Octokit({ auth: `token ${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}` });

async function handleCommitCommentWebhook(payload, res) {
    let repoName = payload?.repository?.name;
    const projects = await Project.findOne({ 'repos.key': repoName });
    if (projects) {
        const { orgId } = projects;
        const org = await Org.findOne({ orgId });
        const { pineconeAPIKey, openAIKey } = org;
        const currentRepo = projects.repos.find(repo => repo.key === repoName);
        if (!currentRepo) {
            console.log(`Repository with name ${repoName} not found in projects`);
            return res.status(404).send('Repository not found');
        }

        const repoUrl = currentRepo.url;
        const repoTargetPath = currentRepo.repoTargetPath;
        const pineconeIndex = currentRepo.pineconeIndex;
        const { body, path, diff_hunk } = payload?.comment;
        const { name } = payload?.repository;
        const { ref } = payload?.pull_request?.head;
        const pattern = /@useocto/i;

        if (pattern.test(body)) {
            let responseBody = {
                commentText: body,
                filePath: path,
                repoName: name,
                diff_hunk: diff_hunk,
                working_branch: ref,
            };
            const pythonProcess = spawn('python', ['/app/octoplus/octo/main.py', `--working_branch=${ref}`, `--diff_hunk=${diff_hunk}`, `--is-git-flow=True`, `--comment-text=${body}`, `--comment-file=${path}`, `--pineconeAPIKey=${pineconeAPIKey}`, `--openAIKey=${openAIKey}`, `--pineconeIndex=${pineconeIndex}`, `--repoUrl=${repoUrl}`, `--repoTargetPath=${repoTargetPath}`], {
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
            console.log('Org not found');
            res.status(404).send('Org not found');
        }
    }
}

router.post('/webhook', async (req, res) => {
    try {
        const payload = req.body;
        console.log("Inside my route");
        handleCommitCommentWebhook(payload, res);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/comment-on-pr-comment', async (req, res) => {
    const { pullRequestId, parentCommentId, commentText } = req.body;
    if (!pullRequestId || !parentCommentId || !commentText) {
        console.log('Missing required parameters');
        return res.status(400).send({ message: 'Missing required parameters' });
    }
    try {
        const response = await octokit.request('POST /repos/{owner}/{repo}/pulls/comments/{comment_id}/replies', {
            owner: process.env.GITHUB_REPO_OWNER,
            repo: process.env.GITHUB_REPO_NAME,
            comment_id: parentCommentId,
            body: commentText
        });
        console.log(`Comment created: ${response.data.html_url}`);
        res.status(200).send({ url: response.data.html_url, id: response.data.id });
    } catch (error) {
        console.error(`Error creating comment: ${error.message}`, error);
        if (error.status === 403 && error.message.includes('rate limit')) {
            res.status(429).send({ message: 'GitHub API rate limit exceeded' });
        } else if (error.status === 404) {
            res.status(404).send({ message: 'Pull request or comment not found' });
        } else {
            res.status(500).send({ message: 'An error occurred while commenting on the pull request comment' });
        }
    }
});

export default router;