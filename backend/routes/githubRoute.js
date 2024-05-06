import express from 'express';
import Project from '../models/projectModel';
import { spawn } from 'child_process';
import Org from '../models/orgModel';

const router = express.Router();
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
        console.log("inside my route")
        //   console.log(payload)
        handleCommitCommentWebhook(payload,res)
        res.status(200).send('Webhook received');
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

export default router;
