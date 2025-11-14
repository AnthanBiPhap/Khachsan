import { Request, Response, NextFunction } from "express";
import chatService from "../services/chat.service";
import { sendJsonSuccess, httpStatus } from "../helpers/response.helper";

// Lấy danh sách conversations của user
export const getConversations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = res.locals.user;
    const userId = user._id.toString();
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const result = await chatService.getConversations(userId, page, limit);
    sendJsonSuccess(res, result, httpStatus.OK.statusCode, httpStatus.OK.message);
  } catch (error) {
    next(error);
  }
};

// Lấy conversation cụ thể
export const getConversationById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = res.locals.user;
    const userId = user._id.toString();
    const { id } = req.params;

    const conversation = await chatService.getConversationById(id, userId);
    sendJsonSuccess(res, conversation, httpStatus.OK.statusCode, httpStatus.OK.message);
  } catch (error) {
    next(error);
  }
};

// Lấy messages của conversation
export const getMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = res.locals.user;
    const userId = user._id.toString();
    const { conversationId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;

    const result = await chatService.getMessages(conversationId, userId, page, limit);
    sendJsonSuccess(res, result, httpStatus.OK.statusCode, httpStatus.OK.message);
  } catch (error) {
    next(error);
  }
};

// Gửi message
export const sendMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = res.locals.user;
    const userId = user._id.toString();
    const { conversationId, content, messageType, attachments, replyTo } = req.body;

    if (!conversationId || !content) {
      return res.status(400).json({
        success: false,
        message: "conversationId and content are required",
      });
    }

    const message = await chatService.sendMessage(
      conversationId,
      userId,
      content,
      messageType || "text",
      attachments || [],
      replyTo
    );

    sendJsonSuccess(res, message, httpStatus.CREATED.statusCode, httpStatus.CREATED.message);
  } catch (error) {
    next(error);
  }
};

// Tạo conversation mới và gửi message đầu tiên
export const startConversation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = res.locals.user;
    const userId = user._id.toString();
    const { otherUserId, content, messageType } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "content is required",
      });
    }

    // Nếu user là customer, tự động tìm admin hoặc staff
    let targetUserId = otherUserId;

    if (user.role === "customer") {
      // Tìm admin hoặc staff đầu tiên
      const User = require("../models/users.model").default;
      const adminOrStaff = await User.findOne({
        role: { $in: ["admin", "staff"] },
        status: "active",
      }).sort({ createdAt: 1 });

      if (!adminOrStaff) {
        return res.status(404).json({
          success: false,
          message: "No admin or staff available",
        });
      }

      targetUserId = adminOrStaff._id.toString();
    } else if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: "otherUserId is required for admin/staff",
      });
    }

    const result = await chatService.startConversation(
      userId,
      targetUserId,
      content,
      messageType || "text"
    );

    sendJsonSuccess(res, result, httpStatus.CREATED.statusCode, httpStatus.CREATED.message);
  } catch (error) {
    next(error);
  }
};

// Xóa message
export const deleteMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = res.locals.user;
    const userId = user._id.toString();
    const { id } = req.params;

    const message = await chatService.deleteMessage(id, userId);
    sendJsonSuccess(res, message, httpStatus.OK.statusCode, httpStatus.OK.message);
  } catch (error) {
    next(error);
  }
};

// Đánh dấu messages đã đọc
export const markMessagesAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = res.locals.user;
    const userId = user._id.toString();
    const { conversationId } = req.params;

    await chatService.markMessagesAsRead(conversationId, userId);
    sendJsonSuccess(res, { success: true }, httpStatus.OK.statusCode, httpStatus.OK.message);
  } catch (error) {
    next(error);
  }
};

// Lấy số lượng unread messages
export const getUnreadCount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = res.locals.user;
    const userId = user._id.toString();

    const unreadCount = await chatService.getUnreadCount(userId);
    sendJsonSuccess(res, { unreadCount }, httpStatus.OK.statusCode, httpStatus.OK.message);
  } catch (error) {
    next(error);
  }
};

export default {
  getConversations,
  getConversationById,
  getMessages,
  sendMessage,
  startConversation,
  deleteMessage,
  markMessagesAsRead,
  getUnreadCount,
};

