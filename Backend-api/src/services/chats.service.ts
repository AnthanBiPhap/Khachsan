import createError from 'http-errors';
import Chat from '../models/chats.model';

const getAll = async (query: any) => {
  const { page = 1, limit = 20, senderId, receiverId } = query;
  const sortType = query.sort_type || 'desc';
  const sortBy = query.sort_by || 'timestamp';
  const sortObject: any = { [sortBy]: sortType === 'desc' ? -1 : 1 };

  // Lọc chat giữa 2 người (2 chiều)
  const where: any = {};
  if (senderId && receiverId) {
    where.$or = [
      { senderId, receiverId },
      { senderId: receiverId, receiverId: senderId }
    ];
  }

  const chats = await Chat.find(where)
    .sort(sortObject)
    .skip((page - 1) * limit)
    .limit(limit);

  const count = await Chat.countDocuments(where);

  return {
    chats,
    pagination: { totalRecord: count, limit, page }
  };
};

const getById = async (id: string) => {
  const chat = await Chat.findById(id);
  if (!chat) throw createError(404, "Chat not found");
  return chat;
};

const create = async (payload: { senderId: string; receiverId: string; message: string }) => {
  if (!payload.senderId || !payload.receiverId || !payload.message) {
    throw createError(400, "senderId, receiverId and message are required");
  }
  const chat = new Chat(payload);
  await chat.save();
  return chat;
};

const updateById = async (id: string, payload: Partial<{ message: string }>) => {
  const chat = await getById(id);
  if (payload.message) chat.message = payload.message;
  await chat.save();
  return chat;
};

const deleteById = async (id: string) => {
  const chat = await getById(id);
  await chat.deleteOne();
  return chat;
};

export default {
  getAll,
  getById,
  create,
  updateById,
  deleteById
};
