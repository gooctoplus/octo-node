import express from 'express';
import { commentOnTicket } from '../services/jira/index.js';
import { spawn } from 'child_process';
import Org from '../models/orgModel';
import Project from '../models/projectModel';

const router = express.Router();
router.post('/:orgId/webhook', async (req, res) => {
  try {
    const { issue } = req.body;
    const { orgId } = req.params;

    const org = await Org.findOne({orgId});
    if(org) {
      const {pineconeAPIKey, openAIKey } = org
      const projects = await Project.find({orgId});
      const currentProject = projects.find(project => issue.self.includes(project.url));
      
      const repoUrl = currentProject.repos[0].url
      const repoTargetPath = currentProject.repos[0].repoTargetPath
      const pineconeIndex = currentProject.repos[0].pineconeIndex

      if (req.body.webhookEvent === 'comment_created' && req.body.comment.author.displayName === "Octo") {
          return res.status(200).send('Ignored sdbot update');
      }
    
      if (req.body.webhookEvent === "jira:issue_updated" && req.body.issue_event_type_name === "issue_assigned" && req.body.issue.fields.assignee.displayName === "Octo") {
    
          const ticketId = issue.key;
          const ticketDescription = issue.fields.description
          
          const pythonProcess = spawn('/app/octoplus/bin/python', ['/app/octoplus/octo/main.py', `--ticket=${ticketDescription}`, `--ticket-id=${ticketId}`, `--pineconeAPIKey=${pineconeAPIKey}`, `--openAIKey=${openAIKey}`, `--pineconeIndex=${pineconeIndex}`, `--repoUrl=${repoUrl}`, `--repoTargetPath=${repoTargetPath}`], {
              cwd: '/app/octoplus/octo/'
          });
          pythonProcess.stdout.on('data', (data) => {
              console.log(`stdout: ${data.toString()}`);
          });
    
          pythonProcess.stderr.on('data', (data) => {
              console.error(`stderr: ${data.toString()}`);
          });
    
          pythonProcess.on('close', (code) => {
              console.log(`child process exited with code ${code}`);
              res.send('Python script executed');
          });
    
      } else {
          res.status(200).send('Webhook received');
      }
    } else {
      console.log('org not found')
      res.status(404).send('Org not found');
    }
  } catch (error) {
    console.error(`Error processing Jira webhook: ${error}`);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/comment', (req, res) => {
  const { comment, ticketId, status, prUrl } = req.body;
  commentOnTicket(ticketId, comment, status, prUrl).then(() => {
      res.send('Comment received successfully');
  }).catch(error => {
      console.error(`Error posting comment: ${error}`);
      res.status(500).send('Internal Server Error');
  });
});
export default router;