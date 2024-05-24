import mongoose from 'mongoose';

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
  repos: [{
    key: { type: String },
    description: { type: String },
    url: { type: String, required: true },
    pineconeIndex: {
        type: String, required: true,
    },
    repoTargetPath: { type: String, required: true },
    defaultBranch: {type: String, required: true},
    languages: [{
      type: String,
    }],
    suffixes: [{
      type: String,
    }]
  }],
});

const projectModel = mongoose.model('Project', projectSchema);

export default projectModel;
