import express from "express";
import chatController from "../../controllers/chatNew.controller";
import { authenticateToken } from "../../middlewares/auth.middleware";

const router = express.Router();

// Tất cả routes đều cần authenticate
router.use(authenticateToken);

// Lấy danh sách conversations
router.get("/conversations", chatController.getConversations);

// Lấy conversation cụ thể
router.get("/conversations/:id", chatController.getConversationById);

// Lấy messages của conversation
router.get("/conversations/:conversationId/messages", chatController.getMessages);

// Gửi message
router.post("/messages", chatController.sendMessage);

// Tạo conversation mới và gửi message đầu tiên
router.post("/conversations/start", chatController.startConversation);

// Xóa message
router.delete("/messages/:id", chatController.deleteMessage);

// Đánh dấu messages đã đọc
router.post("/conversations/:conversationId/read", chatController.markMessagesAsRead);

// Lấy số lượng unread messages
router.get("/messages/unread-count", chatController.getUnreadCount);

export default router;

