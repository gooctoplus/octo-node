import dotenv from 'dotenv';

dotenv.config();

export default {
  PORT: process.env.PORT || 3005,
  MONGODB_URL: process.env.MONGODB_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  API_TOKEN: process.env.API_TOKEN,
  JIRA_BASE_URL: process.env.JIRA_BASE_URL,
  BOT_USERNAME: process.env.BOT_USERNAME,
};