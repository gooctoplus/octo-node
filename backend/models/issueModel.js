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
  // Removed the 'required: true' condition from both fields
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'lastUpdatedAt' } // Automatically generates and updates timestamps
});

const issueModel = mongoose.model("Issue", issueSchema);

issueModel.on('index', error => {
  if (error) {
    console.error("Indexing error in issueModel schema:", error.message); // Log indexing errors
  } else {
    console.log("Indexing successful for issueModel schema");
  }
});

issueModel.createIndexes().catch(error => {
  console.error("Error creating indexes for issueModel:", error); // Log errors related to index creation
});

export default issueModel;