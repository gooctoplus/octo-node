import mongoose from "mongoose";

const issueSchema = new mongoose.Schema({
  issueId: { type: String, required: true },
  orgId: { type: String, required: true },
  project: {
    name: { type: String, required: true },
    projectId: { type: String, required: true },
    key: { type: String, required: true },
  },
  issueType: { type: String, required: true },
  priority: { type: String, required: true },
  status: { type: String, required: true },
  summary: { type: String, required: true },
  reporter: { type: String, required: true },
  createdAt: { type: String, required: true },
  lastUpdatedAt: { type: String, required: true },
});

const issueModel = mongoose.model("Issue", issueSchema);

// Adding console log to track model loading
console.log("Issue model loaded successfully.");

export default issueModel;