import mongoose from "mongoose";

const issueSchema = new mongoose.Schema({
  issueId: { type: String, required: true },
  orgId: { type: String, required: true },
  project: {
    name: { type: String, required: true },
    projectId: { type: String, required: true },
    key: { type: String, required: true },
  },
  issueType: { type: String },
  priority: { type: String },
  status: { type: String },
  summary: { type: String, required: true },
  reporter: { type: String },
  description: { type: String },
  createdAt: { type: String, required: true },
  lastUpdatedAt: { type: String, required: true },
});

const issueModel = mongoose.model("Issue", issueSchema);

export default issueModel;