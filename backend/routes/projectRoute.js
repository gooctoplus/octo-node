import express from 'express';
import Project, { Repo } from '../models/projectModel';

const router = express.Router();
router.post('/add', async (req, res) => {
  const { name, url, orgId, repos, jiraToken, jiraEmail } = req.body;

  const newProject = new Project({
    name,
    url,
    orgId,
    repos,
    jiraToken,
    jiraEmail,
  });

  const createdProject = await newProject.save();
  res.status(201).send({
    _id: createdProject.id,
    name: createdProject.name,
    url: createdProject.url,
    orgId: createdProject.orgId,
    repos: createdProject.repos,
    jiraToken: createdProject.jiraToken,
    jiraEmail: createdProject.jiraEmail,
  });
});

// for adding the repos to the project basis on orgId
router.post('/repos/add', async (req, res) => {
  const { name, orgId, repo } = req.body;
  if (!orgId) {
    return res.status(400).send({ message: 'orgId is required' });
  }
  if (!name) {
    return res.status(400).send({ message: 'name is required' });
  }

  try {
    const projects = await Project.find({ orgId });
    const currentProject = projects.find(project => project.name === name);
    if (!currentProject) {
      return res.status(400).send({ message: 'could not find org' });
    }

    if (repo) {
      const newRepo = new Repo(repo);
      const validationError = newRepo.validateSync();
      if (validationError) {
        return res.status(400).send({ message: 'Invalid repo data', error: validationError.message });
      }
      const updatedProject = await Project.updateOne(
        { _id: currentProject._id },
        { $push: { repos: repo } }
      );
      res.status(200).send({ message: 'Repo added successfully' });
    } else {
      res.status(400).send({ message: 'Repo data is required' });
    }

  } catch (error) {
    console.error(`Error adding repos to project: ${error.message}`, error);
    res.status(500).send({ message: 'Error adding repos to project', error: error.message });
  }
})

export default router;
