import { StreamChat, Channel } from "stream-chat";
import { env } from "../helpers/env.helper";

const apiKey = env.STREAM_API_KEY as string;
const apiSecret = env.STREAM_API_SECRET as string;
console.log(apiKey, apiSecret);
const serverClient = StreamChat.getInstance(apiKey, apiSecret);

// Tạo token cho user
export const createUserToken = (userId: string) => {
  return serverClient.createToken(userId);
};

// Tạo/Update user trong Stream
export const createOrUpdateUser = async (user: {
  id: string;
  name: string;
  image?: string;
}) => {
  return await serverClient.upsertUser(user);
};

// Tạo hoặc lấy channel 1-1
export const createOneToOneChannel = async (
  adminId: string,
  userId: string
): Promise<Channel> => {
  console.log("Create channel with:", { adminId, userId });

  if (!adminId || !userId) {
    throw new Error("adminId or userId is missing");
  }

  // Đảm bảo cả admin và user đều tồn tại trong Stream
  await serverClient.upsertUser({ id: adminId, name: "Admin" });
  await serverClient.upsertUser({ id: userId, name: "User " + userId });

  const channelId = `chat_${adminId}_${userId}`;

  const channel = serverClient.channel("messaging", channelId, {
    members: [adminId, userId], // hoặc [{ id: adminId }, { id: userId }]
    created_by_id: adminId,
  });

  // Tạo hoặc lấy channel
  await channel.create();

  return channel;
};
