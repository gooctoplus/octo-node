import express from 'express';
import Project from '../models/projectModel';
import { getToken, isAuth } from '../util';

const router = express.Router();
router.post('/webhook', async (req, res) => {
  const payload = req.body;
  try {
    // Previously, there were console.log statements here for debugging which have been removed.
    res.status(200).send({
      _id: "this is the end",
    });
  } catch (error) {
    console.error('Error in /webhook route:', error.message, error.stack);
    res.status(500).send('Internal Server Error');
  }
});

export default router;