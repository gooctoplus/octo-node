import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import config from './config';
import orgRoute from './routes/orgRoute';
import jiraRoute from './routes/jiraRoute.js';
import projectRoute from './routes/projectRoute.js';
import githubRoute from './routes/githubRoute.js';

const mongodbUrl = config.MONGODB_URL;
mongoose
  .connect(mongodbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .catch((error) => console.log(error.reason));

const app = express();
app.use(bodyParser.json());
app.use('/api/org', orgRoute);
app.use('/api/project', projectRoute);
app.use('/api/jira', jiraRoute);
app.use('/api/github', githubRoute);
app.use(express.static(path.join(__dirname, '/../frontend/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(`${__dirname}/../frontend/build/index.html`));
});

app.listen(config.PORT, () => {
  console.log(`Server started at http://localhost:${config.PORT}`);
});
