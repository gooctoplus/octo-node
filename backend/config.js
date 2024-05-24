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
  PYTHON_PATH: process.env.PYTHON_PATH,
  PROJECT_PATH: process.env.PROJECT_PATH,
  CURRENT_WORKING_DIRECTORY: process.env.CURRENT_WORKING_DIRECTORY,
};