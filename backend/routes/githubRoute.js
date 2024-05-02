import express from 'express';
import Project from '../models/projectModel';
import { getToken, isAuth } from '../util';
import Org from '../models/orgModel';

const router = express.Router();
async function handleCommitCommentWebhook(payload) {
    
    let repoName = payload?.repository?.name
    const projects = await Project.find({ 'repos.name': repoName });
    if(true) { 
      const {orgId} = projects

      const org = await Org.findOne({orgId});
      const {pineconeAPIKey, openAIKey } = org
    //   const projects = await Project.find({orgId});
    //   const org = await Org.findOne({orgId});
      const currentProject = projects.find(project => issue.self.includes(project.url));
      
      const repoUrl = currentProject.repos[0].url
      const repoTargetPath = currentProject.repos[0].repoTargetPath
      const pineconeIndex = currentProject.repos[0].pineconeIndex

    const {body, path, diff_hunk} = payload?.comment;
    const {name} = payload?.repository;
    const {ref} = payload?.pull_request?.head;
    // Replace '@username' with your actual username or the pattern you want to match
    const pattern = /@useocto/i;
    
    if (pattern.test(body)) {
        responseBody = {
            commentText: body,
            filePath: path,
            repoName: name,
            diff_hunk: diff_hunk,
            working_branch: ref,
        }
        console.log(`Commit comment contains your mention: ${responseBody}`);
        const pythonProcess = spawn('/Users/priyal/projects/octoplus/bin/python', ['/Users/priyal/projects/octoplus/octo/main.py',`--working_branch=${working_branch}`, `--diff_hunk=${diff_hunk}`, `--is-git-flow=True`, `--comment-text=${body}`,  `--comment-file=${path}`,`--pineconeAPIKey=${pineconeAPIKey}`, `--openAIKey=${openAIKey}`, `--pineconeIndex=${pineconeIndex}`, `--repoUrl=${repoUrl}`, `--repoTargetPath=${repoTargetPath}`], {
            cwd: '/Users/priyal/projects/octoplus/octo/'
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
        handleCommitCommentWebhook(payload)
        res.status(200).send('Webhook received');
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

export default router;
