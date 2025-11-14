import { Schema, model } from "mongoose";

const messageSchema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: [true, "Conversation ID is required"],
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender ID is required"],
      index: true,
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file", "system"],
      default: "text",
    },
    // Cho file/image
    attachments: [
      {
        url: String,
        type: String,
        name: String,
        size: Number,
      },
    ],
    // Trạng thái tin nhắn
    status: {
      type: String,
      enum: ["sent", "delivered", "read", "deleted"],
      default: "sent",
    },
    // Đánh dấu đã đọc bởi ai
    readBy: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Tin nhắn được reply
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      required: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index để query nhanh hơn
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ status: 1 });

// Method để mark message as read
messageSchema.methods.markAsRead = async function (userId: string) {
  const isAlreadyRead = this.readBy.some(
    (read: any) => read.userId.toString() === userId.toString()
  );

  if (!isAlreadyRead) {
    this.readBy.push({
      userId,
      readAt: new Date(),
    });
    this.status = "read";
    await this.save();
  }
};

export default model("Message", messageSchema);

