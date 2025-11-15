import { useEffect, useState, useRef, useCallback } from "react";
import {
  Card,
  List,
  Input,
  Button,
  Avatar,
  Typography,
  Space,
  Badge,
  Empty,
  Spin,
  message,
} from "antd";
import {
  MessageOutlined,
  SendOutlined,
  UserOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "../../stores/authStore";
import { useWebSocket } from "../../hooks/useWebSocket";
import chatService, { Conversation, Message } from "../../services/chat.service";
import { io, Socket } from "socket.io-client";
import { env } from "../../constanst/getEnvs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import { playNotificationSound } from "../../utils/soundNotification";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const { Text, Title } = Typography;
const { TextArea } = Input;

export default function ChatPage() {
  const { user, tokens } = useAuthStore();
  const { socket: notificationSocket } = useWebSocket();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [unreadCount, setUnreadCount] = useState<Record<string, number>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Reset state khi user thay đổi (logout/login tài khoản khác)
  useEffect(() => {
    if (!user?._id) {
      // User đã logout, reset tất cả state
      console.log("🚪 Admin logged out, resetting chat state...");
      setConversations([]);
      setSelectedConversation(null);
      setMessages([]);
      setMessageText("");
      setUnreadCount({});
      
      // Disconnect socket nếu có
      if (socket) {
        console.log("🧹 Disconnecting socket on logout");
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // User mới login, reset state và chuẩn bị load conversations mới
    console.log("👤 Admin user changed, resetting chat state for new user:", user._id);
    setConversations([]);
    setSelectedConversation(null);
    setMessages([]);
    setMessageText("");
    setUnreadCount({});
  }, [user?._id]);

  // Khởi tạo Socket.IO
  useEffect(() => {
    if (!user?._id || !tokens?.accessToken) {
      return;
    }

    console.log("Initializing socket connection for admin user:", user._id);
    
    // Disconnect và cleanup socket cũ trước khi tạo socket mới
    // Sử dụng cleanup function của useEffect để đảm bảo socket cũ được disconnect đúng cách
    
    const newSocket = io(env.API_URL, {
      auth: {
        token: tokens.accessToken,
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      forceNew: true, // Tạo connection mới, không reuse connection cũ khi user thay đổi
    });

    newSocket.on("connect", () => {
      console.log("✅ Chat Socket connected:", newSocket.id, "for admin user:", user._id);
      setSocket(newSocket);
    });

    newSocket.on("connected", (data) => {
      console.log("✅ Connected to chat server", data);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("❌ Chat Socket disconnected:", reason);
    });

    newSocket.on("error", (error) => {
      console.error("❌ Chat Socket error:", error);
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
      // Rejoin TẤT CẢ conversation rooms khi reconnect
      // useEffect sẽ tự động join lại khi socket reconnect và conversations có sẵn
      console.log("🔄 Socket reconnected, will rejoin all conversation rooms via useEffect");
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        console.log("🧹 Cleaning up socket for admin user:", user._id);
        newSocket.disconnect();
      }
    };
  }, [user?._id, tokens?.accessToken]);

  // Join TẤT CẢ conversation rooms khi load conversations (không chỉ conversation đang chọn)
  // Điều này đảm bảo admin nhận được message từ tất cả conversations, kể cả khi đang chat với người khác
  useEffect(() => {
    if (!socket || !socket.connected || conversations.length === 0) {
      return;
    }

    console.log("🔌 Joining all conversation rooms:", conversations.length, "conversations");
    conversations.forEach((conv) => {
      console.log("🔌 Joining conversation room:", conv._id);
      socket.emit("join-conversation", conv._id);
    });

    const handleJoined = (data: { conversationId: string }) => {
      console.log("✅ Joined conversation room:", data.conversationId);
    };

    socket.on("joined-conversation", handleJoined);

    return () => {
      socket.off("joined-conversation", handleJoined);
      // KHÔNG leave room khi unmount vì admin cần nhận message từ tất cả conversations
      // Chỉ disconnect socket khi component unmount hoàn toàn
    };
  }, [socket, socket?.connected, conversations]);


  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const result = await chatService.getConversations(1, 50);
      
      // Lọc bỏ các conversation có participant với userId null (user đã bị xóa)
      const validConversations = result.conversations.filter((conv) => {
        if (!conv?.participants || !Array.isArray(conv.participants)) {
          return false;
        }
        // Kiểm tra xem có ít nhất một participant hợp lệ (có userId và userId._id)
        const hasValidParticipant = conv.participants.some(
          (p) => p?.userId && p.userId._id && p.userId._id !== user?._id
        );
        return hasValidParticipant;
      });
      
      setConversations(validConversations);
      
      // Load unread count
      const unreadMap: Record<string, number> = {};
      validConversations.forEach((conv) => {
        const count = conv.unreadCount?.[user?._id || ""] || 0;
        if (count > 0) {
          unreadMap[conv._id] = count;
        }
      });
      setUnreadCount(unreadMap);
    } catch (error) {
      console.error("Error loading conversations:", error);
      message.error("Không thể tải danh sách cuộc trò chuyện");
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  // Load messages
  const loadMessages = async (conversationId: string) => {
    try {
      setLoading(true);
      const result = await chatService.getMessages(conversationId, 1, 50);
      setMessages(result.messages);
      scrollToBottom();
      
      // Join conversation room
      if (socket) {
        socket.emit("join-conversation", conversationId);
      }
      
      // Đánh dấu đã đọc
      await chatService.markMessagesAsRead(conversationId);
      
      // Cập nhật unread count
      setUnreadCount((prev) => {
        const newCount = { ...prev };
        newCount[conversationId] = 0;
        return newCount;
      });
    } catch (error) {
      console.error("Error loading messages:", error);
      message.error("Không thể tải tin nhắn");
    } finally {
      setLoading(false);
    }
  };

  // Chọn conversation
  const handleSelectConversation = (conversation: Conversation) => {
    console.log("🔀 Selecting conversation:", conversation._id);
    setSelectedConversation(conversation);
    // Load messages sẽ được gọi sau khi selectedConversation được set
    // Join room sẽ được xử lý bởi useEffect
    loadMessages(conversation._id);
  };

  // Gửi message
  const handleSendMessage = async () => {
    if (!messageText.trim() || sending || !selectedConversation) return;

    try {
      setSending(true);
      // Gửi message (message sẽ được nhận qua socket)
      await chatService.sendMessage(
        selectedConversation._id,
        messageText.trim()
      );

      // Không thêm message vào state ở đây vì sẽ nhận qua socket
      setMessageText("");
    } catch (error) {
      console.error("Error sending message:", error);
      message.error("Không thể gửi tin nhắn");
    } finally {
      setSending(false);
    }
  };

  // Lắng nghe message mới từ socket (setup một lần)
  useEffect(() => {
    if (!socket || !user?._id) {
      console.log("⚠️ Socket or user not ready for message listener");
      return;
    }

    console.log("🎧 Setting up message listener for admin chat");

    const handleNewMessage = (data: { conversationId: string; message: Message }) => {
      console.log("📩 [ADMIN] Received new message via socket:", {
        conversationId: data.conversationId,
        messageId: data.message._id,
        senderId: data.message.senderId?._id || data.message.senderId,
        currentConversationId: selectedConversation?._id,
        messageContent: data.message.content?.substring(0, 50),
      });

      // Kiểm tra message có hợp lệ không
      if (!data.message || !data.message._id) {
        console.error("❌ Invalid message data received:", data);
        return;
      }

      if (data.conversationId === selectedConversation?._id) {
        setMessages((prev) => {
          // Kiểm tra xem message đã có chưa (tránh duplicate)
          const exists = prev.find((m) => m._id === data.message._id);
          if (exists) {
            console.log("⚠️ Message already exists, skipping:", data.message._id);
            return prev;
          }
          console.log("✅ Adding new message to state:", data.message._id);
          return [...prev, data.message];
        });
        scrollToBottom();
        
        // Cập nhật conversation trong danh sách
        setConversations((prev) => {
          return prev.map((conv) => {
            if (conv._id === data.conversationId) {
              return {
                ...conv,
                lastMessage: data.message,
                lastMessageAt: data.message.createdAt,
              };
            }
            return conv;
          }).sort((a, b) => {
            const aTime = new Date(a.lastMessageAt).getTime();
            const bTime = new Date(b.lastMessageAt).getTime();
            return bTime - aTime;
          });
        });
        
        // Đánh dấu đã đọc nếu message không phải từ chính user
        const senderId = typeof data.message.senderId === 'object' 
          ? data.message.senderId._id 
          : data.message.senderId;
        if (senderId !== user._id) {
          // Phát âm thanh thông báo khi nhận message từ người khác
          playNotificationSound();
          chatService.markMessagesAsRead(data.conversationId);
          // Cập nhật unread count
          setUnreadCount((prev) => {
            const newCount = { ...prev };
            newCount[data.conversationId] = 0;
            return newCount;
          });
        }
      } else {
        // Message thuộc conversation khác - admin đang chat với người khác
        console.log("📬 Message from other conversation (admin is chatting with someone else), playing sound and updating conversation list");
        playNotificationSound();
        
        // Cập nhật conversation trong danh sách (cập nhật lastMessage và lastMessageAt)
        setConversations((prev) => {
          return prev.map((conv) => {
            if (conv._id === data.conversationId) {
              return {
                ...conv,
                lastMessage: data.message,
                lastMessageAt: data.message.createdAt,
              };
            }
            return conv;
          }).sort((a, b) => {
            const aTime = new Date(a.lastMessageAt).getTime();
            const bTime = new Date(b.lastMessageAt).getTime();
            return bTime - aTime;
          });
        });
        
        // Cập nhật unread count cho conversation này
        setUnreadCount((prev) => {
          const newCount = { ...prev };
          const currentUnread = newCount[data.conversationId] || 0;
          newCount[data.conversationId] = currentUnread + 1;
          return newCount;
        });
      }
    };

    socket.on("new_message", handleNewMessage);

    return () => {
      console.log("🧹 Cleaning up message listener");
      socket.off("new_message", handleNewMessage);
    };
  }, [socket, user?._id, selectedConversation?._id, loadConversations]);

  // Load conversations khi user login và socket connect
  useEffect(() => {
    if (!user?._id || !tokens?.accessToken) {
      return;
    }

    // Chỉ load conversations khi socket đã connect
    if (socket && socket.connected) {
      console.log("👤 Admin user logged in and socket connected, loading conversations for user:", user._id);
      loadConversations();
    } else if (socket && !socket.connected) {
      // Đợi socket connect trước khi load conversations
      console.log("⏳ Waiting for socket to connect before loading conversations...");
      const handleConnect = () => {
        console.log("✅ Socket connected, loading conversations for admin user:", user._id);
        loadConversations();
      };
      socket.once("connect", handleConnect);
      return () => {
        socket.off("connect", handleConnect);
      };
    }
  }, [user?._id, tokens?.accessToken, socket, socket?.connected, loadConversations]);

  // Format time
  // Format date
  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("DD/MM/YYYY HH:mm");
  };

  // Kiểm tra xem có nên hiển thị thời gian không
  // Chỉ hiển thị thời gian khi:
  // 1. Tin nhắn đầu tiên
  // 2. Tin nhắn từ người gửi khác (so với tin nhắn trước)
  // 3. Tin nhắn cách tin nhắn trước hơn 5 phút
  const shouldShowTimestamp = (currentMessage: Message, index: number) => {
    // Tin nhắn đầu tiên luôn hiển thị thời gian
    if (index === 0) {
      return true;
    }

    const previousMessage = messages[index - 1];
    if (!previousMessage) {
      return true;
    }

    // Nếu tin nhắn từ người gửi khác, hiển thị thời gian
    const currentSenderId = typeof currentMessage.senderId === 'object' 
      ? currentMessage.senderId._id 
      : currentMessage.senderId;
    const previousSenderId = typeof previousMessage.senderId === 'object' 
      ? previousMessage.senderId._id 
      : previousMessage.senderId;
    
    if (currentSenderId !== previousSenderId) {
      return true;
    }

    // Nếu cách nhau hơn 5 phút, hiển thị thời gian
    const currentTime = new Date(currentMessage.createdAt).getTime();
    const previousTime = new Date(previousMessage.createdAt).getTime();
    const timeDiff = currentTime - previousTime;
    const fiveMinutes = 5 * 60 * 1000; // 5 phút tính bằng milliseconds

    return timeDiff > fiveMinutes;
  };

  // Get other participant
  const getOtherParticipant = (conversation: Conversation) => {
    if (!conversation?.participants || !Array.isArray(conversation.participants)) {
      return null;
    }
    return conversation.participants.find(
      (p) => p?.userId && p.userId._id && p.userId._id !== user?._id
    )?.userId || null;
  };

  // Get last message preview
  const getLastMessagePreview = (conversation: Conversation) => {
    if (!conversation.lastMessage) return "Chưa có tin nhắn";
    return conversation.lastMessage.content.substring(0, 50) + (conversation.lastMessage.content.length > 50 ? "..." : "");
  };

  return (
    <div style={{ padding: 24, height: "calc(100vh - 64px)", display: "flex", gap: 16 }}>
      {/* Danh sách conversations */}
      <Card
        title={
          <Space>
            <MessageOutlined />
            <span>Tin nhắn</span>
            <Badge count={Object.values(unreadCount).reduce((a, b) => a + b, 0)} />
          </Space>
        }
        style={{ width: 350, height: "100%", display: "flex", flexDirection: "column" }}
        styles={{ body: { flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", padding: 0 } }}
      >
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading && conversations.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center" }}>
              <Spin />
            </div>
          ) : conversations.length === 0 ? (
            <Empty description="Chưa có cuộc trò chuyện nào" />
          ) : (
            <List
              dataSource={conversations}
              renderItem={(conversation) => {
                const otherParticipant = getOtherParticipant(conversation);
                const unread = unreadCount[conversation._id] || 0;
                const isSelected = selectedConversation?._id === conversation._id;

                return (
                  <List.Item
                    style={{
                      cursor: "pointer",
                      padding: "12px 16px",
                      backgroundColor: isSelected ? "#e6f7ff" : "transparent",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                    onClick={() => handleSelectConversation(conversation)}
                  >
                    <List.Item.Meta
                      avatar={
                        <Badge count={unread > 0 ? unread : 0} offset={[-5, 5]}>
                          <Avatar
                            icon={<UserOutlined />}
                            src={otherParticipant?.email}
                            style={{ backgroundColor: "#1890ff" }}
                          />
                        </Badge>
                      }
                      title={
                        <Space>
                          <Text strong>{otherParticipant?.fullName || "Khách hàng"}</Text>
                          {unread > 0 && (
                            <Badge count={unread} style={{ backgroundColor: "#ff4d4f" }} />
                          )}
                        </Space>
                      }
                      description={
                        <Text
                          type="secondary"
                          ellipsis
                          style={{ fontSize: 12, display: "block" }}
                        >
                          {getLastMessagePreview(conversation)}
                        </Text>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          )}
        </div>
      </Card>

      {/* Chat window */}
      <Card
        title={
          selectedConversation ? (
            <Space>
              <Avatar
                icon={<UserOutlined />}
                src={getOtherParticipant(selectedConversation)?.email}
                style={{ backgroundColor: "#1890ff" }}
              />
              <div>
                <Text strong>
                  {getOtherParticipant(selectedConversation)?.fullName || "Khách hàng"}
                </Text>
                <div style={{ fontSize: 12, color: "#8c8c8c" }}>
                  {socket?.connected ? "Đang trực tuyến" : "Đang kết nối..."}
                </div>
              </div>
            </Space>
          ) : (
            <span>Chọn cuộc trò chuyện</span>
          )
        }
        style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column" }}
        styles={{ body: { flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", padding: 0 } }}
      >
        {selectedConversation ? (
          <>
            {/* Messages */}
            <div
              ref={messagesContainerRef}
              style={{
                flex: 1,
                overflowY: "auto",
                padding: 16,
                backgroundColor: "#f5f5f5",
              }}
            >
              {loading && messages.length === 0 ? (
                <div style={{ textAlign: "center", padding: 24 }}>
                  <Spin />
                </div>
              ) : messages.length === 0 ? (
                <Empty description="Chưa có tin nhắn" />
              ) : (
                messages.map((msg, index) => {
                  const isOwnMessage = typeof msg.senderId === 'object'
                    ? msg.senderId._id === user?._id
                    : msg.senderId === user?._id;
                  const showSenderName = !isOwnMessage && shouldShowTimestamp(msg, index);
                  const messageId = `msg-${msg._id}`;
                  
                  return (
                    <div
                      key={msg._id}
                      style={{
                        display: "flex",
                        justifyContent: isOwnMessage ? "flex-end" : "flex-start",
                        marginBottom: index > 0 ? 4 : 16,
                      }}
                    >
                      <div
                        id={messageId}
                        style={{
                          maxWidth: "75%",
                          padding: "10px 16px",
                          borderRadius: 16,
                          backgroundColor: isOwnMessage ? "#9333ea" : "#f3e8ff",
                          color: isOwnMessage ? "#fff" : "#1f2937",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                          position: "relative",
                          cursor: "default",
                          transition: "all 0.2s ease",
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                        }}
                        title={`${formatDate(msg.createdAt)}`}
                      >
                        {showSenderName && (
                          <Text
                            strong
                            style={{
                              display: "block",
                              marginBottom: 6,
                              fontSize: 12,
                              color: isOwnMessage ? "rgba(255,255,255,0.9)" : "#7c3aed",
                            }}
                          >
                            {typeof msg.senderId === 'object' 
                              ? msg.senderId.fullName 
                              : 'Người dùng'}
                          </Text>
                        )}
                        <Text style={{ 
                          color: isOwnMessage ? "#fff" : "#1f2937",
                          lineHeight: 1.5,
                          fontSize: 14,
                        }}>
                          {msg.content}
                        </Text>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: 16, borderTop: "1px solid #f0f0f0", backgroundColor: "#fff" }}>
              <Space.Compact style={{ width: "100%" }}>
                <TextArea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onPressEnter={(e) => {
                    if (e.shiftKey) {
                      return;
                    }
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  placeholder="Nhập tin nhắn..."
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  disabled={sending}
                  style={{ flex: 1 }}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || sending}
                  loading={sending}
                >
                  Gửi
                </Button>
              </Space.Compact>
            </div>
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Empty description="Chọn một cuộc trò chuyện để bắt đầu" />
          </div>
        )}
      </Card>
    </div>
  );
}

