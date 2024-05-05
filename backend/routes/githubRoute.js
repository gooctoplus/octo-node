import express from 'express';
import Project from '../models/projectModel';
import { spawn } from 'child_process';
import { getToken, isAuth } from '../util';
import Org from '../models/orgModel';
import axios from 'axios';

const router = express.Router();

async function replyToGithubComment(commentUrl, message) {
  try {
    const response = await axios.post(`${commentUrl}/replies`, {
      body: message
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (response.status === 201) {
      console.log('Reply successfully posted to GitHub comment');
      return { success: true };
    } else {
      console.error(`Failed to post reply, GitHub API responded with status: ${response.status}`);
      return { success: false, error: `GitHub API responded with status: ${response.status}` };
    }
  } catch (error) {
    console.error('Error posting reply to GitHub:', error);
    return { success: false, error: error.message };
  }
}

async function handleCommitCommentWebhook(payload, res) {
  const repoName = payload?.repository?.name;
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

    const { action, comment } = payload;
    const codePattern = /\b2001\b/;
    
    if (action === 'edited' && codePattern.test(comment.body)) {
      const replyResult = await replyToGithubComment(comment.url, 'We have received your code `2001`. Thank you!');
      
      if (replyResult.success) {
        console.log('Reply posted successfully.');
        return res.send('Reply posted successfully.');
      } else {
        console.error('Failed to post reply:', replyResult.error);
        return res.status(500).send('Failed to post reply.');
      }
    } else {
      console.log('No action taken, conditions not met.');
      return res.status(200).send('Webhook received, no action taken.');
    }
  } else {
    console.log('Project not found');
    return res.status(404).send('Project not found');
  }
}

router.post('/webhook', async (req, res) => {
  try {
    const payload = req.body;
    console.log("Webhook received");
    await handleCommitCommentWebhook(payload, res);
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;