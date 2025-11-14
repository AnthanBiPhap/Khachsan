import { Schema, model } from "mongoose";

const conversationSchema = new Schema(
  {
    participants: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["customer", "staff", "admin"],
          required: true,
        },
        lastReadAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      required: false,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["active", "archived", "deleted"],
      default: "active",
    },
    // Metadata
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index để tìm conversation nhanh hơn
conversationSchema.index({ "participants.userId": 1 });
conversationSchema.index({ lastMessageAt: -1 });
conversationSchema.index({ status: 1 });

// Method để tìm hoặc tạo conversation giữa 2 users
conversationSchema.statics.findOrCreate = async function (
  userId1: string,
  userId2: string
) {
  const conversation = await this.findOne({
    "participants.userId": { $all: [userId1, userId2] },
    status: { $ne: "deleted" },
  })
    .populate("participants.userId", "fullName email phoneNumber role")
    .populate("lastMessage");

  if (conversation) {
    return conversation;
  }

  // Lấy thông tin users
  const User = model("User");
  const [user1, user2] = await Promise.all([
    User.findById(userId1),
    User.findById(userId2),
  ]);

  if (!user1 || !user2) {
    throw new Error("User not found");
  }

  // Tạo conversation mới
  const newConversation = new this({
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

export default model("Conversation", conversationSchema);

