import mongoose from 'mongoose';

const orgSchema = new mongoose.Schema({
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
  }
});

const orgModel = mongoose.model('Org', orgSchema);

export default orgModel;
