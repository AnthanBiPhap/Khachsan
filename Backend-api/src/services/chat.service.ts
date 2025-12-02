import createError from "http-errors";
import Conversation from "../models/conversations.model";
import Message from "../models/messages.model";
import User from "../models/users.model";
import socketService from "./socket.service";

/**
 * Tìm hoặc tạo conversation giữa 2 người dùng:
 * Nếu đã có conversation thì trả về, nếu chưa có thì tạo mới
 */
const findOrCreateConversation = async (userId1: string, userId2: string) => {
  // Tìm conversation hiện tại giữa 2 người dùng
  const existingConversation = await Conversation.findOne({
    "participants.userId": { $all: [userId1, userId2] },
    status: { $ne: "deleted" },
  })
    .populate("participants.userId", "fullName email phoneNumber role")
    .populate("lastMessage")
    .sort({ createdAt: -1 });

  // Nếu đã có conversation thì trả về
  if (existingConversation) {
    return existingConversation;
  }

  // Lấy thông tin của 2 người dùng
  const [user1, user2] = await Promise.all([
    User.findById(userId1),
    User.findById(userId2),
  ]);

  // Nếu không tìm thấy một trong hai người dùng thì báo lỗi
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

/**
 * Lấy danh sách conversations của người dùng với phân trang,
 * sắp xếp theo thời gian tin nhắn cuối cùng
 */
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

/**
 * Lấy thông tin chi tiết của một conversation theo ID,
 * kiểm tra người dùng có tham gia conversation không
 */
const getConversationById = async (conversationId: string, userId: string) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    "participants.userId": userId,
    status: { $ne: "deleted" },
  })
    .populate("participants.userId", "fullName email phoneNumber role")
    .populate("lastMessage");

  // Nếu không tìm thấy conversation thì báo lỗi
  if (!conversation) {
    throw createError(404, "Không tìm thấy cuộc trò chuyện");
  }

  return conversation;
};

/**
 * Lấy danh sách messages của conversation với phân trang,
 * tự động đánh dấu messages là đã đọc khi người dùng xem
 */
const getMessages = async (
  conversationId: string,
  userId: string,
  page: number = 1,
  limit: number = 50
) => {
  // Kiểm tra người dùng có tham gia conversation không
  const conversation = await Conversation.findOne({
    _id: conversationId,
    "participants.userId": userId,
    status: { $ne: "deleted" },
  });

  // Nếu không tìm thấy conversation thì báo lỗi
  if (!conversation) {
    throw createError(404, "Không tìm thấy cuộc trò chuyện");
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

  // Đảo ngược thứ tự để hiển thị từ cũ đến mới
  messages.reverse();

  const total = await Message.countDocuments({
    conversationId,
    status: { $ne: "deleted" },
  });

  // Đánh dấu các messages là đã đọc
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

  // Cập nhật thời gian đọc cuối cùng của người dùng trong conversation
  const participant = conversation.participants.find(
    (p: any) => {
      const participantId = typeof p.userId === 'object' ? p.userId._id.toString() : p.userId.toString();
      return participantId === userId.toString();
    }
  );
  // Nếu tìm thấy participant, cập nhật lastReadAt
  if (participant) {
    participant.lastReadAt = new Date();
  }
  // Nếu chưa có unreadCount thì khởi tạo
  if (!conversation.unreadCount) {
    conversation.unreadCount = new Map();
  }
  // Đặt số tin nhắn chưa đọc của người dùng về 0
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

/**
 * Gửi message trong conversation: tạo message mới, cập nhật conversation,
 * tăng unread count cho người nhận và gửi thông báo qua WebSocket
 */
const sendMessage = async (
  conversationId: string,
  senderId: string,
  content: string,
  messageType: string = "text",
  attachments: any[] = [],
  replyTo: string | undefined = undefined
) => {
  // Kiểm tra conversation có tồn tại và người gửi có tham gia không
  const conversation = await Conversation.findOne({
    _id: conversationId,
    "participants.userId": senderId,
    status: { $ne: "deleted" },
  }).populate("participants.userId", "fullName email phoneNumber role");

  // Nếu không tìm thấy conversation thì báo lỗi
  if (!conversation) {
    throw createError(404, "Không tìm thấy cuộc trò chuyện");
  }

  // Tạo message mới
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
  // Nếu có replyTo thì populate thông tin message được reply
  if (replyTo) {
    await message.populate("replyTo");
  }

  // Cập nhật thông tin conversation: lastMessage và lastMessageAt
  conversation.lastMessage = message._id;
  conversation.lastMessageAt = new Date();

  // Tìm người nhận và tăng unread count cho họ
  const receiver = conversation.participants.find(
    (p: any) => {
      const userId = typeof p.userId === 'object' ? p.userId._id.toString() : p.userId.toString();
      return userId !== senderId;
    }
  );

  // Nếu tìm thấy người nhận, tăng unread count
  if (receiver) {
    const receiverId = typeof receiver.userId === 'object' ? receiver.userId._id.toString() : receiver.userId.toString();
    // Nếu chưa có unreadCount thì khởi tạo
    if (!conversation.unreadCount) {
      conversation.unreadCount = new Map();
    }
    // Lấy số tin nhắn chưa đọc hiện tại và tăng lên 1
    const currentUnread = conversation.unreadCount.get(receiverId) || 0;
    conversation.unreadCount.set(receiverId, currentUnread + 1);
  }

  await conversation.save();

  // Chuyển message thành plain object với đầy đủ thông tin
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

/**
 * Tạo conversation mới và gửi message đầu tiên:
 * Tìm hoặc tạo conversation giữa 2 người dùng và gửi message khởi tạo
 */
const startConversation = async (
  userId1: string,
  userId2: string,
  content: string,
  messageType: string = "text"
) => {
  // Tìm hoặc tạo conversation giữa 2 người dùng
  const conversation = await findOrCreateConversation(userId1, userId2);

  // Gửi message đầu tiên trong conversation
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

/**
 * Xóa message: chỉ người gửi mới có thể xóa message của mình,
 * gửi thông báo qua WebSocket khi xóa thành công
 */
const deleteMessage = async (messageId: string, userId: string) => {
  // Tìm message và kiểm tra người dùng có phải người gửi không
  const message = await Message.findOne({
    _id: messageId,
    senderId: userId,
  });

  // Nếu không tìm thấy message thì báo lỗi
  if (!message) {
    throw createError(404, "Message not found");
  }

  // Đánh dấu message là đã xóa (soft delete)
  message.status = "deleted";
  await message.save();

  // Gửi thông báo xóa message qua WebSocket đến tất cả người trong conversation
  socketService.sendToRoom(`conversation:${message.conversationId}`, "message_deleted", {
    messageId: message._id.toString(),
    conversationId: message.conversationId.toString(),
  });

  return message;
};

/**
 * Đánh dấu tất cả messages trong conversation là đã đọc:
 * Cập nhật readBy cho các messages, lastReadAt cho participant và unreadCount
 */
const markMessagesAsRead = async (conversationId: string, userId: string) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    "participants.userId": userId,
    status: { $ne: "deleted" },
  });

  // Nếu không tìm thấy conversation thì báo lỗi
  if (!conversation) {
    throw createError(404, "Không tìm thấy cuộc trò chuyện");
  }

  // Cập nhật tất cả messages chưa đọc thành đã đọc
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

  // Cập nhật thông tin conversation: lastReadAt và unreadCount
  const participant = conversation.participants.find(
    (p: any) => {
      const participantId = typeof p.userId === 'object' ? p.userId._id.toString() : p.userId.toString();
      return participantId === userId.toString();
    }
  );
  // Nếu tìm thấy participant, cập nhật lastReadAt
  if (participant) {
    participant.lastReadAt = new Date();
  }
  // Nếu chưa có unreadCount thì khởi tạo
  if (!conversation.unreadCount) {
    conversation.unreadCount = new Map();
  }
  // Đặt số tin nhắn chưa đọc của người dùng về 0
  conversation.unreadCount.set(userId.toString(), 0);
  await conversation.save();

  // Gửi thông báo đã đọc messages qua WebSocket
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
  // Duyệt qua tất cả conversations và tính tổng số tin nhắn chưa đọc
  conversations.forEach((conv) => {
    // Nếu có unreadCount và là Map, lấy số lượng chưa đọc của người dùng
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

