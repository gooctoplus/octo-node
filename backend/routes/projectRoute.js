import express from 'express';
import Project from '../models/projectModel';
import Repo from '../models/repoModel';

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

  try {
    const createdProject = await newProject.save();
    console.log(`Project created successfully: ${createdProject.name}`);
    res.status(201).send({
      _id: createdProject.id,
      name: createdProject.name,
      url: createdProject.url,
      orgId: createdProject.orgId,
      repos: createdProject.repos,
      jiraToken: createdProject.jiraToken,
      jiraEmail: createdProject.jiraEmail,
    });
  } catch (error) {
    console.error(`Error creating project: ${error.message}`, error);
    res.status(500).send({ message: 'Error creating project', error: error.message });
  }
});

// Improved '/repos/add' endpoint with enhanced validation and error handling
router.post('/repos/add', async (req, res) => {
  const { name, orgId, repo } = req.body;

  // Validate 'orgId'
  if (!orgId) {
    return res.status(400).send({ message: 'orgId is required' });
  }

  // Validate 'name'
  if (!name) {
    return res.status(400).send({ message: 'name is required' });
  }

  // Validate 'repo' not only for existence but also its structure/content
  if (!repo) {
    return res.status(400).send({ message: 'Repo data is required' });
  }

  try {
    // Find the project by orgId and name to ensure it exists
    const project = await Project.findOne({ orgId, name });
    if (!project) {
      console.log(`Project not found for orgId: ${orgId} and name: ${name}`);
      return res.status(404).send({ message: 'Project not found for given orgId and name' });
    }

    // Instantiate a Repo with the provided 'repo' data to validate against the schema
    const newRepo = new Repo(repo);
    const validationError = newRepo.validateSync();
    if (validationError) {
      console.log(`Invalid repo data: ${validationError.message}`);
      return res.status(400).send({ 
        message: 'Invalid repo data', 
        error: validationError.message // Providing specific validation error message
      });
    }

    // If validation passes, add the repo to the project
    await Project.updateOne(
      { _id: project._id },
      { $push: { repos: repo } }
    );
    console.log(`Repo added successfully to project: ${project.name}`);
    res.status(200).send({ message: 'Repo added successfully' });

  } catch (error) {
    console.error(`Error adding repos to project: ${error.message}`, error);
    res.status(500).send({ 
      message: 'Error adding repos to project', 
      error: error.message // Including the specific error message from the catch block
    });
  }
});

export default router;
