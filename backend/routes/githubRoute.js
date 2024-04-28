import express from 'express';
import Project from '../models/projectModel';
import { getToken, isAuth } from '../util';

const router = express.Router();
router.post('/webhook', async (req, res) => {
  const payload = req.body;
  console.log("inside my route")
  console.log(payload)
  res.status(200).send({
    _id: "this is the end",
  });
});

export default router;
