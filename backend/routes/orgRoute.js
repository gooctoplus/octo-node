import express from 'express';
import Org from '../models/orgModel';
import { getToken, isAuth } from '../util';

const router = express.Router();

router.put('/:id', isAuth, async (req, res) => {
  const userId = req.params.id;
  const user = await Org.findById(userId);
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.password = req.body.password || user.password;
    const updatedUser = await user.save();
    res.send({
      _id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      token: getToken(updatedUser),
    });
  } else {
    res.status(404).send({ message: 'User Not Found' });
  }
});

router.post('/add', async (req, res) => {
  const { name, email, orgId, pineconeAPIKey, maxTickets, openAIKey, projects } = req.body;

  const newOrg = new Org({
    name,
    email,
    orgId,
    pineconeAPIKey,
    maxTickets,
    openAIKey,
  });

  const createdOrg = await newOrg.save();
  res.status(201).send({
    _id: createdOrg.id,
    name: createdOrg.name,
    email: createdOrg.email,
    orgId: createdOrg.orgId,
    pineconeAPIKey: createdOrg.pineconeAPIKey,
    maxTickets: createdOrg.maxTickets,
    openAIKey: createdOrg.openAIKey,
  });
});


export default router;
