import mongoose from 'mongoose';

const orgSchema = new mongoose.Schema({
  // ...existing fields...,
  name: { type: String, required: true },
  email: {
    type: String, required: true, unique: true,
  },
  orgId: {
    type: String, required: true, unique: true,
  },
  pineconeAPIKey: {
    type: String, required: true, unique: true,
  },
  maxTickets: {
    type: Number, required: true,
  },
  openAIKey: {
    type: String, required: true,
  },
  authToken: { type: String, required: false }
});

const orgModel = mongoose.model('Org', orgSchema);

export default orgModel;