import app from "./app";
import { env } from "./helpers/env.helper";
import mongoose from "mongoose";
import seedAdmin, { seedServices } from "./seeder";
import { createServer } from "http";
import socketService from "./services/socket.service";

/// Start the server
const mongooseDbOptions = {
  autoIndex: true, // Tự động tạo index
  maxPoolSize: 10, // Số lượng kết nối tối đa
  serverSelectionTimeoutMS: 5000, // Thời gian chờ chọn server (ms)
  socketTimeoutMS: 45000, // Thời gian chờ socket (ms)
  family: 4, // Sử dụng IPv4
};

mongoose
  .connect(env.MongoDB_URI as string, mongooseDbOptions)
  .then(async () => {
    console.log("Connected to MongoDB successfully");
    await seedAdmin();
    await seedServices();
    
    // Tạo HTTP server từ Express app
    const httpServer = createServer(app);
    
    // Khởi tạo WebSocket server
    socketService.initialize(httpServer);
    
    // Start the server after successful MongoDB connection
    httpServer.listen(env.port, () => {
      console.log(`Server is running on port http://localhost:${env.port}`);
      console.log(`WebSocket server is ready`);
    });
  })
  .catch((err) => {
    console.error("Failed to Connect to MongoDB", err);
  });
