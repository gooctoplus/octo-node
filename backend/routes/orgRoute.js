import express from 'express';
import jwt from 'jsonwebtoken'; // Import jsonwebtoken for token generation
import Org from '../models/orgModel';
import { getToken, isAuth } from '../util';

const router = express.Router();

// Middleware for token validation
const validateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.log('No token provided');
    return res.status(401).send({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1]; // Assuming the Authorization header format is "Bearer <token>"
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Unauthorized! Invalid token', err);
      return res.status(401).send({ message: 'Unauthorized! Invalid token' });
    }
    req.user = decoded; // Optional: Store any decoded information (like user ID) in request for further use
    console.log('Token validated successfully');
    next(); // Token is valid, continue to the next middleware or request handler
  });
};

router.put('/:id', isAuth, async (req, res) => {
  const userId = req.params.id;
  const user = await Org.findById(userId).catch(error => {
    console.error(`Error finding user with ID ${userId}`, error);
    res.status(500).send({ message: 'Error finding user', error: error.message });
  });

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.password = req.body.password || user.password;
    const updatedUser = await user.save().catch(error => {
      console.error(`Error updating user with ID ${userId}`, error);
      res.status(500).send({ message: 'Error updating user', error: error.message });
    });

    console.log(`User updated with ID: ${updatedUser._id}`);
    res.send({
      _id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      token: getToken(updatedUser),
    });
  } else {
    console.log(`User Not Found with ID: ${userId}`);
    res.status(404).send({ message: 'User Not Found' });
  }
});

router.post('/add', validateToken, async (req, res) => {
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