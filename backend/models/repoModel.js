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

const Repo = mongoose.model('Repo', repoSchema);

export { Repo, repoSchema };
export default Repo;