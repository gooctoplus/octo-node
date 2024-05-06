import mongoose from "mongoose";

const issueSchema = new mongoose.Schema({
  issueId: { type: String, required: true },
  orgId: { type: String, required: true },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project"
  },
  issueType: { type: String },
  priority: { type: String },
  status: { type: String },
  summary: { type: String, required: true },
  reporter: { type: String },
  description: { type: String },
  createdAt: { type: String },
  updatedAt: { type: String },
});

const issueModel = mongoose.model("Issue", issueSchema);

export default issueModel;