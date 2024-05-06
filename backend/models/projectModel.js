import mongoose from 'mongoose';

const repoSchema = new mongoose.Schema({
  key: { type: String },
  description: { type: String },
  url: { type: String, required: true },
  pineconeIndex: {
    type: String, required: true,
  },
  repoTargetPath: { type: String, required: true },
  defaultBranch: { type: String, required: true },
  languages: [{
    type: String,
  }],
  suffixes: [{
    type: String,
  }]
});

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
export const Repo = mongoose.model('Repo', repoSchema);

export default projectModel;
