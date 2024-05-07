import mongoose from 'mongoose';
import { repoSchema } from './repoModel'; // Importing repoSchema

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: {
    type: String, required: true, unique: true,
  },
  orgId: {
    type: String, required: true,
  },
  jiraToken: {
    type: String, required: true,
  },
  jiraEmail: {
    type: String, required: true,
  },
  repos: [repoSchema],
});

const projectModel = mongoose.model('Project', projectSchema);
export default projectModel;