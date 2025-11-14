import createError from "http-errors";
import Conversation from "../models/conversations.model";
import Message from "../models/messages.model";
import User from "../models/users.model";
import socketService from "./socket.service";

// Tìm hoặc tạo conversation giữa 2 users
const findOrCreateConversation = async (userId1: string, userId2: string) => {
  // Tìm conversation hiện tại
  const existingConversation = await Conversation.findOne({
    "participants.userId": { $all: [userId1, userId2] },
    status: { $ne: "deleted" },
  })
    .populate("participants.userId", "fullName email phoneNumber role")
    .populate("lastMessage")
    .sort({ createdAt: -1 });

  if (existingConversation) {
    return existingConversation;
  }

  // Lấy thông tin users
  const [user1, user2] = await Promise.all([
    User.findById(userId1),
    User.findById(userId2),
  ]);

  if (!user1 || !user2) {
    throw createError(404, "User not found");
  }

  // Tạo conversation mới
  const newConversation = new Conversation({
    participants: [
      {
        userId: userId1,
        role: user1.role,
        lastReadAt: new Date(),
      },
      {
        userId: userId2,
        role: user2.role,
        lastReadAt: new Date(),
      },
    ],
    unreadCount: new Map([
      [userId1.toString(), 0],
      [userId2.toString(), 0],
    ]),
  });

  await newConversation.save();
  await newConversation.populate("participants.userId", "fullName email phoneNumber role");

  return newConversation;
};

// Lấy danh sách conversations của user
const getConversations = async (userId: string, page: number = 1, limit: number = 20) => {
  const skip = (page - 1) * limit;

  const conversations = await Conversation.find({
    "participants.userId": userId,
    status: { $ne: "deleted" },
  })
    .populate("participants.userId", "fullName email phoneNumber role")
    .populate("lastMessage")
    .sort({ lastMessageAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Conversation.countDocuments({
    "participants.userId": userId,
    status: { $ne: "deleted" },
  });

  return {
    conversations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Lấy conversation cụ thể
const getConversationById = async (conversationId: string, userId: string) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    "participants.userId": userId,
    status: { $ne: "deleted" },
  })
    .populate("participants.userId", "fullName email phoneNumber role")
    .populate("lastMessage");

  if (!conversation) {
    throw createError(404, "Conversation not found");
  }

  return conversation;
};

// Lấy messages của conversation
const getMessages = async (
  conversationId: string,
  userId: string,
  page: number = 1,
  limit: number = 50
) => {
  // Kiểm tra user có trong conversation không
  const conversation = await Conversation.findOne({
    _id: conversationId,
    "participants.userId": userId,
    status: { $ne: "deleted" },
  });

  if (!conversation) {
    throw createError(404, "Conversation not found");
  }

  const skip = (page - 1) * limit;

  const messages = await Message.find({
    conversationId,
    status: { $ne: "deleted" },
  })
    .populate("senderId", "fullName email phoneNumber role")
    .populate("replyTo")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // Đảo ngược để hiển thị từ cũ đến mới
  messages.reverse();

  const total = await Message.countDocuments({
    conversationId,
    status: { $ne: "deleted" },
  });

  // Mark messages as read
  await Message.updateMany(
    {
      conversationId,
      senderId: { $ne: userId },
      "readBy.userId": { $ne: userId },
    },
    {
      $push: {
        readBy: {
          userId,
          readAt: new Date(),
        },
      },
      $set: {
        status: "read",
      },
    }
  );

  // Cập nhật lastReadAt của user trong conversation
  const participant = conversation.participants.find(
    (p: any) => {
      const participantId = typeof p.userId === 'object' ? p.userId._id.toString() : p.userId.toString();
      return participantId === userId.toString();
    }
  );
  if (participant) {
    participant.lastReadAt = new Date();
  }
  if (!conversation.unreadCount) {
    conversation.unreadCount = new Map();
  }
  conversation.unreadCount.set(userId.toString(), 0);
  await conversation.save();

  return {
    messages,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Gửi message
const sendMessage = async (
  conversationId: string,
  senderId: string,
  content: string,
  messageType: string = "text",
  attachments: any[] = [],
  replyTo: string | undefined = undefined
) => {
  // Kiểm tra conversation
  const conversation = await Conversation.findOne({
    _id: conversationId,
    "participants.userId": senderId,
    status: { $ne: "deleted" },
  }).populate("participants.userId", "fullName email phoneNumber role");

  if (!conversation) {
    throw createError(404, "Conversation not found");
  }

  // Tạo message
  const message = new Message({
    conversationId,
    senderId,
    content,
    messageType,
    attachments,
    replyTo,
    status: "sent",
  });

  await message.save();
  await message.populate("senderId", "fullName email phoneNumber role");
  if (replyTo) {
    await message.populate("replyTo");
  }

  // Cập nhật conversation
  conversation.lastMessage = message._id;
  conversation.lastMessageAt = new Date();

  // Tăng unread count cho người nhận
  const receiver = conversation.participants.find(
    (p: any) => {
      const userId = typeof p.userId === 'object' ? p.userId._id.toString() : p.userId.toString();
      return userId !== senderId;
    }
  );

  if (receiver) {
    const receiverId = typeof receiver.userId === 'object' ? receiver.userId._id.toString() : receiver.userId.toString();
    if (!conversation.unreadCount) {
      conversation.unreadCount = new Map();
    }
    const currentUnread = conversation.unreadCount.get(receiverId) || 0;
    conversation.unreadCount.set(receiverId, currentUnread + 1);
  }

  await conversation.save();

  // Convert message thành plain object với đầy đủ thông tin
  const messageObj = message.toObject();
  
  // Đảm bảo senderId được populate đúng cách
  if (message.senderId && typeof message.senderId === 'object') {
    messageObj.senderId = {
      _id: message.senderId._id.toString(),
      fullName: message.senderId.fullName,
      email: message.senderId.email,
      phoneNumber: message.senderId.phoneNumber,
      role: message.senderId.role,
    };
  }

  // Gửi message đến conversation room (tất cả users trong conversation sẽ nhận)
  // Không gửi riêng đến receiver vì sẽ duplicate
  console.log("📤 Sending message to room:", `conversation:${conversationId}`, {
    conversationId: conversation._id.toString(),
    messageId: messageObj._id,
    senderId: messageObj.senderId?._id,
  });
  
  socketService.sendToRoom(`conversation:${conversationId}`, "new_message", {
    conversationId: conversation._id.toString(),
    message: messageObj,
  });

  return message;
};

// Tạo conversation mới và gửi message đầu tiên
const startConversation = async (
  userId1: string,
  userId2: string,
  content: string,
  messageType: string = "text"
) => {
  // Tìm hoặc tạo conversation
  const conversation = await findOrCreateConversation(userId1, userId2);

  // Gửi message đầu tiên
  const message = await sendMessage(
    conversation._id.toString(),
    userId1,
    content,
    messageType
  );

  return {
    conversation,
    message,
  };
};

// Xóa message
const deleteMessage = async (messageId: string, userId: string) => {
  const message = await Message.findOne({
    _id: messageId,
    senderId: userId,
  });

  if (!message) {
    throw createError(404, "Message not found");
  }

  message.status = "deleted";
  await message.save();

  // Gửi notification qua WebSocket
  socketService.sendToRoom(`conversation:${message.conversationId}`, "message_deleted", {
    messageId: message._id.toString(),
    conversationId: message.conversationId.toString(),
  });

  return message;
};

// Đánh dấu messages đã đọc
const markMessagesAsRead = async (conversationId: string, userId: string) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    "participants.userId": userId,
    status: { $ne: "deleted" },
  });

  if (!conversation) {
    throw createError(404, "Conversation not found");
  }

  // Cập nhật messages
  await Message.updateMany(
    {
      conversationId,
      senderId: { $ne: userId },
      "readBy.userId": { $ne: userId },
    },
    {
      $push: {
        readBy: {
          userId,
          readAt: new Date(),
        },
      },
      $set: {
        status: "read",
      },
    }
  );

  // Cập nhật conversation
  const participant = conversation.participants.find(
    (p: any) => {
      const participantId = typeof p.userId === 'object' ? p.userId._id.toString() : p.userId.toString();
      return participantId === userId.toString();
    }
  );
  if (participant) {
    participant.lastReadAt = new Date();
  }
  if (!conversation.unreadCount) {
    conversation.unreadCount = new Map();
  }
  conversation.unreadCount.set(userId.toString(), 0);
  await conversation.save();

  // Gửi notification qua WebSocket
  socketService.sendToRoom(`conversation:${conversationId}`, "messages_read", {
    conversationId,
    userId,
  });
};

// Lấy số lượng unread messages
const getUnreadCount = async (userId: string) => {
  const conversations = await Conversation.find({
    "participants.userId": userId,
    status: { $ne: "deleted" },
  });

  let totalUnread = 0;
  conversations.forEach((conv) => {
    if (conv.unreadCount && conv.unreadCount instanceof Map) {
      const unread = conv.unreadCount.get(userId.toString()) || 0;
      totalUnread += unread;
    }
  });

  return totalUnread;
};

export default {
  findOrCreateConversation,
  getConversations,
  getConversationById,
  getMessages,
  sendMessage,
  startConversation,
  deleteMessage,
  markMessagesAsRead,
  getUnreadCount,
};

