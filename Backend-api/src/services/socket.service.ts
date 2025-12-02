import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/users.model";
import { env } from "../helpers/env.helper";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

/**
 * SocketService: Quản lý WebSocket connections và real-time communication
 * - Xác thực user qua JWT token
 * - Quản lý rooms (user rooms, role rooms, conversation rooms)
 * - Gửi message đến user cụ thể, room, hoặc broadcast
 */
class SocketService {
  private io: SocketIOServer | null = null;
  // Map lưu trữ mapping userId -> socketId để theo dõi users đang online
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  /**
   * Khởi tạo Socket.IO server với middleware xác thực và xử lý kết nối
   */
  initialize(server: HttpServer) {
    // Khởi tạo Socket.IO server với cấu hình CORS và transports
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*", // Có thể cấu hình cụ thể hơn trong production
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ["websocket", "polling"], // Hỗ trợ cả websocket và polling
    });

    // Middleware xác thực cho Socket.IO: kiểm tra JWT token và user status
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        // Lấy token từ handshake.auth hoặc Authorization header
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(" ")[1];

        // Nếu không có token thì báo lỗi
        if (!token) {
          return next(new Error("Authentication error: No token provided"));
        }

        // Verify JWT token và lấy user ID
        const decoded = jwt.verify(token, env.JWT_SECRET as string) as { _id: string };
        // Tìm user trong database (không lấy password và __v)
        const user = await User.findOne({ _id: decoded._id }).select("-password -__v");

        // Nếu không tìm thấy user thì báo lỗi
        if (!user) {
          return next(new Error("Authentication error: User not found"));
        }

        // Nếu user bị block thì không cho kết nối
        if (user.status !== "active") {
          return next(new Error("Authentication error: User is blocked"));
        }

        // Gán userId và user vào socket để sử dụng sau này
        socket.userId = user._id.toString();
        socket.user = user;
        next();
      } catch (error) {
        // Nếu token không hợp lệ thì báo lỗi
        next(new Error("Authentication error: Invalid token"));
      }
    });

    // Xử lý kết nối: khi user kết nối thành công
    this.io.on("connection", (socket: AuthenticatedSocket) => {
      const userId = socket.userId!;
      const socketId = socket.id;
      
      // Đảm bảo userId là string để tránh lỗi khi so sánh
      const userIdStr = userId.toString();

      console.log(`✅ User ${userIdStr} connected with socket ID: ${socketId}`);
      console.log(`   UserId type: ${typeof userId}, value: ${userId}`);
      console.log(`   UserId string: ${userIdStr}`);

      // Lưu mapping userId -> socketId (lưu cả string và ObjectId nếu có)
      this.connectedUsers.set(userIdStr, socketId);
      // Nếu userId là ObjectId, cũng lưu dạng string để đảm bảo tìm được
      if (userId !== userIdStr) {
        this.connectedUsers.set(userId, socketId);
      }
      console.log(`📝 Đã lưu mapping: userId ${userIdStr} -> socketId ${socketId}`);

      // Gửi thông báo kết nối thành công cho client
      socket.emit("connected", {
        message: "Connected to WebSocket server",
        userId,
        socketId,
      });

      // Join room theo userId để có thể gửi message đến user cụ thể
      const userRoom = `user:${userIdStr}`;
      socket.join(userRoom);
      console.log(`✅ User ${userIdStr} đã join room: ${userRoom}`);
      
      // Nếu userId khác userIdStr, cũng join room với userId gốc để đảm bảo nhận được message
      if (userId !== userIdStr) {
        const userRoomOriginal = `user:${userId}`;
        socket.join(userRoomOriginal);
        console.log(`✅ User ${userIdStr} cũng đã join room: ${userRoomOriginal}`);
      }

      // Join room theo role nếu có (để gửi message đến tất cả users cùng role)
      if (socket.user?.role) {
        const roleRoom = `role:${socket.user.role}`;
        socket.join(roleRoom);
        console.log(`✅ User ${userIdStr} đã join role room: ${roleRoom}`);
      }
      
      // Log tất cả rooms mà user đã join để debug
      const rooms = Array.from(socket.rooms);
      console.log(`📋 User ${userIdStr} đang ở trong các rooms:`, rooms);

      // Thiết lập các event handlers tùy chỉnh
      this.setupEventHandlers(socket);

      // Xử lý disconnect: xóa mapping khi user ngắt kết nối
      socket.on("disconnect", () => {
        console.log(`User ${userIdStr} disconnected`);
        this.connectedUsers.delete(userIdStr);
        // Xóa cả mapping với userId gốc nếu có
        if (userId !== userIdStr) {
          this.connectedUsers.delete(userId);
        }
      });

      // Xử lý lỗi socket
      socket.on("error", (error) => {
        console.error(`Socket error for user ${userId}:`, error);
      });
    });

    console.log("WebSocket server initialized");
    return this.io;
  }

  /**
   * Thiết lập các event handlers cho socket: ping/pong, join/leave rooms, conversation, send message
   */
  private setupEventHandlers(socket: AuthenticatedSocket) {
    const userId = socket.userId!;

    // Event: ping/pong để kiểm tra kết nối còn sống không
    socket.on("ping", () => {
      socket.emit("pong", { timestamp: new Date().toISOString() });
    });

    // Event: join room tùy chỉnh (cho phép client join room bất kỳ)
    socket.on("join-room", (room: string) => {
      socket.join(room);
      socket.emit("joined-room", { room });
      console.log(`User ${userId} joined room: ${room}`);
    });

    // Event: leave room tùy chỉnh
    socket.on("leave-room", (room: string) => {
      socket.leave(room);
      socket.emit("left-room", { room });
      console.log(`User ${userId} left room: ${room}`);
    });

    // Event: join conversation room (để nhận message trong conversation)
    socket.on("join-conversation", async (conversationId: string) => {
      try {
        const roomName = `conversation:${conversationId}`;
        await socket.join(roomName);
        socket.emit("joined-conversation", { conversationId });
        
        // Log số lượng clients trong room để debug
        const roomClients = this.io?.sockets.adapter.rooms.get(roomName);
        const clientCount = roomClients ? roomClients.size : 0;
        console.log(`✅ User ${userId} joined conversation: ${conversationId} (Room: ${roomName}, Clients: ${clientCount})`);
        
        // Log tất cả conversation rooms hiện tại để debug
        if (this.io) {
          const allRooms = Array.from(this.io.sockets.adapter.rooms.keys());
          console.log(`   All active rooms:`, allRooms.filter(r => r.startsWith('conversation:')));
        }
      } catch (error) {
        console.error(`❌ Error joining conversation room ${conversationId}:`, error);
      }
    });

    // Event: leave conversation room
    socket.on("leave-conversation", (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
      socket.emit("left-conversation", { conversationId });
      console.log(`User ${userId} left conversation: ${conversationId}`);
    });

    // Event: gửi message đến user cụ thể (legacy, giữ lại để tương thích)
    socket.on("send-message", (data: { toUserId: string; message: any }) => {
      const { toUserId, message } = data;
      this.sendToUser(toUserId, "new-message", {
        from: userId,
        message,
        timestamp: new Date().toISOString(),
      });
    });

    // Event: broadcast message đến tất cả users (trừ chính user gửi)
    socket.on("broadcast", (data: any) => {
      socket.broadcast.emit("broadcast-message", {
        from: userId,
        data,
        timestamp: new Date().toISOString(),
      });
    });
  }

  /**
   * Gửi message đến user cụ thể thông qua room user:userId
   * @param {string} userId - ID của user cần gửi message
   * @param {string} event - Tên event để emit
   * @param {any} data - Dữ liệu cần gửi
   */
  sendToUser(userId: string, event: string, data: any) {
    // Kiểm tra Socket.IO đã được khởi tạo chưa
    if (!this.io) {
      console.error('❌ Socket.IO not initialized');
      return;
    }

    // Chuyển userId sang string để đảm bảo khớp với room name
    const userIdStr = userId.toString();
    
    // Gửi đến room user:userId (đảm bảo user đã join room khi kết nối)
    const roomName = `user:${userIdStr}`;
    
    // Kiểm tra xem room có tồn tại và có bao nhiêu clients
    const room = this.io.sockets.adapter.rooms.get(roomName);
    const clientCount = room ? room.size : 0;
    
    console.log(`📤 [sendToUser] Gửi ${event} đến user ${userIdStr}`);
    console.log(`   Room: ${roomName}, Clients trong room: ${clientCount}`);
    console.log(`   Data:`, JSON.stringify(data, null, 2));
    
    // Gửi message đến room (tất cả clients trong room sẽ nhận được)
    this.io.to(roomName).emit(event, data);
    
    // Log để debug: kiểm tra xem user có trong connectedUsers map không
    const socketId = this.connectedUsers.get(userIdStr);
    if (socketId) {
      console.log(`✅ Đã gửi ${event} đến user ${userIdStr} (socketId: ${socketId}, room: ${roomName}, clients: ${clientCount})`);
    } else {
      console.log(`⚠️ User ${userIdStr} không có trong connectedUsers map, nhưng đã gửi đến room ${roomName} (clients: ${clientCount})`);
    }
    
    // Nếu không có client nào trong room, log cảnh báo
    if (clientCount === 0) {
      console.warn(`⚠️ ⚠️ ⚠️ Không có client nào trong room ${roomName}! User có thể chưa kết nối hoặc chưa join room.`);
      console.warn(`   Tất cả connected users:`, Array.from(this.connectedUsers.keys()));
      console.warn(`   Tất cả active rooms:`, Array.from(this.io.sockets.adapter.rooms.keys()).filter(r => r.startsWith('user:')));
    }
  }

  /**
   * Gửi message đến room cụ thể (ví dụ: role:admin, conversation:123)
   * @param {string} room - Tên room cần gửi message
   * @param {string} event - Tên event để emit
   * @param {any} data - Dữ liệu cần gửi
   */
  sendToRoom(room: string, event: string, data: any) {
    // Kiểm tra Socket.IO đã được khởi tạo chưa
    if (!this.io) {
      console.warn(`⚠️ WebSocket server chưa được khởi tạo. Không thể gửi message đến room: ${room}`);
      return;
    }
    
    try {
      // Lấy số lượng clients trong room để log
      const roomClients = this.io.sockets.adapter.rooms.get(room);
      const clientCount = roomClients ? roomClients.size : 0;
      
      console.log(`📤 [sendToRoom] Gửi ${event} đến room ${room}`);
      console.log(`   Clients trong room: ${clientCount}`);
      console.log(`   Data:`, JSON.stringify(data, null, 2));
      
      // Gửi message đến room (bao gồm cả sender nếu sender đã join room)
      this.io.to(room).emit(event, data);
      
      // Log chi tiết để debug
      if (clientCount > 0) {
        console.log(`✅ Đã gửi "${event}" đến room "${room}" (${clientCount} clients)`);
        // Log thông tin message nếu có
        if (data.conversationId || data.message?._id) {
          console.log(`   Message data:`, {
            conversationId: data.conversationId,
            messageId: data.message?._id,
            senderId: data.message?.senderId?._id,
          });
        }
      } else {
        // Cảnh báo nếu room không có clients nào
        console.warn(`⚠️ ⚠️ ⚠️ Room "${room}" không có clients nào đang online! Notification sẽ không được nhận.`);
        console.warn(`   Tất cả rooms hiện tại:`, Array.from(this.io.sockets.adapter.rooms.keys()));
        console.warn(`   Tất cả role rooms:`, Array.from(this.io.sockets.adapter.rooms.keys()).filter(r => r.startsWith('role:')));
      }
    } catch (error) {
      console.error(`❌ Lỗi gửi message đến room "${room}":`, error);
      throw error;
    }
  }

  /**
   * Broadcast message đến tất cả users đang kết nối
   * @param {string} event - Tên event để emit
   * @param {any} data - Dữ liệu cần gửi
   */
  broadcast(event: string, data: any) {
    if (!this.io) return;
    this.io.emit(event, data);
  }

  /**
   * Broadcast message đến tất cả users trừ sender (socketId cụ thể)
   * @param {string} socketId - Socket ID cần loại trừ
   * @param {string} event - Tên event để emit
   * @param {any} data - Dữ liệu cần gửi
   */
  broadcastExcept(socketId: string, event: string, data: any) {
    if (!this.io) return;
    this.io.except(socketId).emit(event, data);
  }

  /**
   * Lấy số lượng users đang online (đang kết nối)
   * @returns {number} Số lượng users đang online
   */
  getOnlineUsersCount(): number {
    return this.connectedUsers.size;
  }

  /**
   * Kiểm tra user có đang online không
   * @param {string} userId - ID của user cần kiểm tra
   * @returns {boolean} true nếu user đang online, false nếu không
   */
  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  /**
   * Lấy Socket.IO server instance
   * @returns {SocketIOServer | null} Socket.IO server instance hoặc null nếu chưa khởi tạo
   */
  getIO(): SocketIOServer | null {
    return this.io;
  }
}

// Export singleton instance
export default new SocketService();

