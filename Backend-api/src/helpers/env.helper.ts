import { config } from "dotenv";
const originalLog = console.log;
console.log = () => {};
config();
console.log = originalLog;

// dùng file này quản lí các biến môi trường
export const env = {
  port: process.env.PORT || 8080,
  nodeEnv: process.env.NODE_ENV || "development",
  MongoDB_URI: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/Khachsan",
  JWT_SECRET: process.env.JWT_SECRET || "your_jwt_secret",
  STREAM_API_KEY: process.env.STREAM_API_KEY || "your_stream_api_key",
  STREAM_API_SECRET: process.env.STREAM_API_SECRET || "your_stream_api_secret",
  GMAIL_USER: process.env.GMAIL_USER || "",
  GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD || "",
};
