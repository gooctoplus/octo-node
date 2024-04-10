import express from 'express';
import Project from '../models/projectModel';
import { getToken, isAuth } from '../util';

const router = express.Router();
router.post('/add', async (req, res) => {
  const { name, url, orgId, repos } = req.body;

  const newProject = new Project({
    name,
    url,
    orgId,
    repos,
  });

  const createdProject = await newProject.save();
  res.status(201).send({
    _id: createdProject.id,
    name: createdProject.name,
    url: createdProject.url,
    orgId: createdProject.orgId,
    repos: createdProject.repos,
  });
});

export default router;
