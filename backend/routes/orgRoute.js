import express from 'express';
import jwt from 'jsonwebtoken'; // Import jsonwebtoken for token generation
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
  const { name, email, orgId, pineconeAPIKey, maxTickets, openAIKey } = req.body;

  const newOrg = new Org({
    name,
    email,
    orgId,
    pineconeAPIKey,
    maxTickets,
    openAIKey,
  });

  try {
    // Generate an authentication token for the new organization before saving
    const token = jwt.sign({ _id: newOrg._id.toString() }, process.env.JWT_SECRET, { expiresIn: '24h' });
    newOrg.authToken = token; // Saving token in the newOrg instance

    const createdOrg = await newOrg.save();
    console.log(`New organization added with ID: ${createdOrg._id} and authToken generated.`);
    res.status(201).send({
      _id: createdOrg._id,
      name: createdOrg.name,
      email: createdOrg.email,
      orgId: createdOrg.orgId,
      pineconeAPIKey: createdOrg.pineconeAPIKey,
      maxTickets: createdOrg.maxTickets,
      openAIKey: createdOrg.openAIKey,
      authToken: createdOrg.authToken, // Include authToken in the response
    });
  } catch (error) {
    console.error(`Error creating organization: ${error.message}`, error);
    res.status(500).send({ message: 'Error creating organization', error: error.message });
  }
});

export default router;