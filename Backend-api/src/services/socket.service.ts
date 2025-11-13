import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/users.model";
import { env } from "../helpers/env.helper";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

class SocketService {
  private io: SocketIOServer | null = null;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  initialize(server: HttpServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*", // Có thể cấu hình cụ thể hơn trong production
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ["websocket", "polling"],
    });

    // Middleware xác thực cho Socket.IO
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(" ")[1];

        if (!token) {
          return next(new Error("Authentication error: No token provided"));
        }

        const decoded = jwt.verify(token, env.JWT_SECRET as string) as { _id: string };
        const user = await User.findOne({ _id: decoded._id }).select("-password -__v");

        if (!user) {
          return next(new Error("Authentication error: User not found"));
        }

        if (user.status !== "active") {
          return next(new Error("Authentication error: User is blocked"));
        }

        socket.userId = user._id.toString();
        socket.user = user;
        next();
      } catch (error) {
        next(new Error("Authentication error: Invalid token"));
      }
    });

    // Xử lý kết nối
    this.io.on("connection", (socket: AuthenticatedSocket) => {
      const userId = socket.userId!;
      const socketId = socket.id;

      console.log(`User ${userId} connected with socket ID: ${socketId}`);

      // Lưu mapping userId -> socketId
      this.connectedUsers.set(userId, socketId);

      // Gửi thông báo kết nối thành công
      socket.emit("connected", {
        message: "Connected to WebSocket server",
        userId,
        socketId,
      });

      // Join room theo userId để có thể gửi message đến user cụ thể
      socket.join(`user:${userId}`);

      // Join room theo role nếu cần
      if (socket.user?.role) {
        socket.join(`role:${socket.user.role}`);
      }

      // Xử lý các events tùy chỉnh
      this.setupEventHandlers(socket);

      // Xử lý disconnect
      socket.on("disconnect", () => {
        console.log(`User ${userId} disconnected`);
        this.connectedUsers.delete(userId);
      });

      // Xử lý lỗi
      socket.on("error", (error) => {
        console.error(`Socket error for user ${userId}:`, error);
      });
    });

    console.log("WebSocket server initialized");
    return this.io;
  }

  private setupEventHandlers(socket: AuthenticatedSocket) {
    const userId = socket.userId!;

    // Event: ping/pong để kiểm tra kết nối
    socket.on("ping", () => {
      socket.emit("pong", { timestamp: new Date().toISOString() });
    });

    // Event: join room tùy chỉnh
    socket.on("join-room", (room: string) => {
      socket.join(room);
      socket.emit("joined-room", { room });
      console.log(`User ${userId} joined room: ${room}`);
    });

    // Event: leave room
    socket.on("leave-room", (room: string) => {
      socket.leave(room);
      socket.emit("left-room", { room });
      console.log(`User ${userId} left room: ${room}`);
    });

    // Event: gửi message đến user cụ thể
    socket.on("send-message", (data: { toUserId: string; message: any }) => {
      const { toUserId, message } = data;
      this.sendToUser(toUserId, "new-message", {
        from: userId,
        message,
        timestamp: new Date().toISOString(),
      });
    });

    // Event: broadcast message đến tất cả users
    socket.on("broadcast", (data: any) => {
      socket.broadcast.emit("broadcast-message", {
        from: userId,
        data,
        timestamp: new Date().toISOString(),
      });
    });
  }

  // Gửi message đến user cụ thể
  sendToUser(userId: string, event: string, data: any) {
    if (!this.io) return;

    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    } else {
      // Nếu user không online, có thể lưu vào database để gửi sau
      console.log(`User ${userId} is not online. Message queued.`);
    }
  }

  // Gửi message đến room
  sendToRoom(room: string, event: string, data: any) {
    if (!this.io) return;
    this.io.to(room).emit(event, data);
  }

  // Broadcast đến tất cả users
  broadcast(event: string, data: any) {
    if (!this.io) return;
    this.io.emit(event, data);
  }

  // Broadcast đến tất cả users trừ sender
  broadcastExcept(socketId: string, event: string, data: any) {
    if (!this.io) return;
    this.io.except(socketId).emit(event, data);
  }

  // Lấy số lượng users đang online
  getOnlineUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Kiểm tra user có online không
  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  // Lấy socket instance
  getIO(): SocketIOServer | null {
    return this.io;
  }
}

// Export singleton instance
export default new SocketService();

