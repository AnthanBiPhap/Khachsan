"use client";

import { useEffect, useState, useRef } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import chatService, { Conversation, Message } from "@/services/chatService";
import { io, Socket } from "socket.io-client";
import authService from "@/services/authService";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { playNotificationSound } from "@/utils/soundNotification";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function CustomerChat() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom khi có message mới
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
    // Lưu user._id hiện tại để so sánh
    const currentUserId = user?._id;
    
    if (!currentUserId) {
      // User đã logout, reset tất cả state
      console.log("🚪 User logged out, resetting chat state...");
      setConversation(null);
      setMessages([]);
      setMessageText("");
      setUnreadCount(0);
      setIsOpen(false);
      return;
    }

    // User mới login hoặc user thay đổi, reset state
    console.log("👤 User changed/login, resetting chat state for user:", currentUserId);
    setConversation(null);
    setMessages([]);
    setMessageText("");
    setUnreadCount(0);
    setIsOpen(false);
    
    // Note: Socket sẽ được disconnect và tạo mới trong useEffect khác khi user._id thay đổi
  }, [user?._id]);

  // Khởi tạo Socket.IO
  useEffect(() => {
    if (!user?._id || !authService.getToken()) {
      return;
    }

    const token = authService.getToken();
    if (!token) return;

    console.log("🔌 Initializing Socket.IO connection for user:", user._id);
    
    // Disconnect và cleanup socket cũ trước khi tạo socket mới
    // Sử dụng cleanup function của useEffect để đảm bảo socket cũ được disconnect đúng cách
    
    // Kết nối Socket.IO với token mới
    // forceNew: true đảm bảo tạo connection mới, không reuse connection cũ
    const newSocket = io(API_URL, {
      auth: {
        token: token,
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      forceNew: true, // Tạo connection mới, không reuse connection cũ khi user thay đổi
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id, "for user:", user._id);
    });

    newSocket.on("connected", (data) => {
      console.log("✅ Connected to chat server", data);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
    });

    newSocket.on("error", (error) => {
      console.error("❌ Socket error:", error);
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
      // Rejoin conversation room khi reconnect (nếu có conversation)
      // useEffect sẽ tự động join lại khi conversation được load
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        console.log("🧹 Cleaning up socket for user:", user._id);
        newSocket.disconnect();
      }
    };
  }, [user?._id]);

  // Join conversation room ngay khi có conversation (KHÔNG cần đợi mở chat)
  // Điều này đảm bảo customer luôn nhận được message, kể cả khi đóng chat
  useEffect(() => {
    if (!socket || !conversation?._id) {
      console.log("⚠️ Socket or conversation not ready:", { 
        socket: !!socket, 
        conversationId: conversation?._id, 
        connected: socket?.connected 
      });
      return;
    }

    // Đợi socket connect nếu chưa connect
    if (!socket.connected) {
      console.log("⏳ Socket not connected, waiting...");
      const handleConnect = () => {
        console.log("✅ Socket connected, joining room:", conversation._id);
        socket.emit("join-conversation", conversation._id);
      };
      socket.once("connect", handleConnect);
      return () => {
        socket.off("connect", handleConnect);
      };
    }

    console.log("🔌 Joining conversation room (always, not just when chat is open):", conversation._id);
    socket.emit("join-conversation", conversation._id);
    
    // Lắng nghe xác nhận join room
    const handleJoined = (data: { conversationId: string }) => {
      console.log("✅ Successfully joined conversation room:", data.conversationId);
    };

    socket.on("joined-conversation", handleJoined);

    return () => {
      socket.off("joined-conversation", handleJoined);
      // KHÔNG leave room khi unmount vì customer cần nhận message ngay cả khi đóng chat
      // Chỉ disconnect socket khi component unmount hoàn toàn hoặc user logout
    };
  }, [socket, conversation?._id]);

  // Lắng nghe message mới từ socket (setup một lần khi socket connect)
  useEffect(() => {
    if (!socket || !user?._id) {
      console.log("Socket or user not ready for message listener");
      return;
    }

    console.log("Setting up message listener for socket");

    const handleNewMessage = (data: { conversationId: string; message: Message }) => {
      console.log("📩 Received new message via socket:", {
        conversationId: data.conversationId,
        messageId: data.message._id,
        senderId: data.message.senderId._id,
        currentConversationId: conversation?._id,
      });

      // Kiểm tra message có hợp lệ không
      if (!data.message || !data.message._id) {
        console.error("❌ Invalid message data received:", data);
        return;
      }

      // Lấy senderId (có thể là object hoặc string)
      const senderId = typeof data.message.senderId === 'object' 
        ? data.message.senderId._id || data.message.senderId 
        : data.message.senderId;

      // Nếu message thuộc conversation hiện tại
      if (data.conversationId === conversation?._id) {
        console.log("✅ Message belongs to current conversation, adding to state");
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
        // Đánh dấu đã đọc nếu message không phải từ chính user
        if (senderId !== user._id) {
          // Phát âm thanh thông báo khi nhận message từ người khác
          playNotificationSound();
          chatService.markMessagesAsRead(data.conversationId);
          loadUnreadCount();
        }
      } else {
        // Message thuộc conversation khác
        console.log("📬 Message from other conversation, playing sound and updating unread count");
        playNotificationSound();
        loadUnreadCount();
      }
    };

    socket.on("new_message", handleNewMessage);

    // Lắng nghe khi socket reconnect để join lại room
    const handleReconnect = () => {
      console.log("🔄 Socket reconnected, rejoining conversation room");
      if (conversation?._id && socket.connected) {
        socket.emit("join-conversation", conversation._id);
      }
    };

    socket.on("connect", handleReconnect);

    return () => {
      console.log("Cleaning up message listener");
      socket.off("new_message", handleNewMessage);
      socket.off("connect", handleReconnect);
    };
  }, [socket, user?._id, conversation?._id]);

  // Load conversation ngay khi user login (KHÔNG cần đợi mở chat)
  // Điều này đảm bảo customer luôn join room và nhận được message
  useEffect(() => {
    if (!user?._id) {
      return;
    }

    // Load conversation ngay khi có user, không cần đợi mở chat
    if (socket && socket.connected) {
      console.log("👤 User logged in, loading conversation...");
      loadConversation();
    } else if (socket && !socket.connected) {
      console.log("⏳ Waiting for socket to connect...");
      const handleConnect = () => {
        console.log("✅ Socket connected, loading conversation...");
        loadConversation();
      };
      socket.once("connect", handleConnect);
      return () => {
        socket.off("connect", handleConnect);
      };
    }
  }, [user?._id, socket, socket?.connected]);

  // Load messages khi mở chat (chỉ để hiển thị, không cần để nhận message)
  useEffect(() => {
    if (isOpen && conversation?._id) {
      console.log("💬 Chat opened, loading messages...");
      if (messages.length === 0) {
        loadMessages(conversation._id);
      }
      // Đánh dấu đã đọc khi mở chat
      chatService.markMessagesAsRead(conversation._id);
      loadUnreadCount();
    }
  }, [isOpen, conversation?._id]);

  // Load unread count
  const loadUnreadCount = async () => {
    try {
      const count = await chatService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Error loading unread count:", error);
    }
  };

  // Load conversation
  const loadConversation = async () => {
    try {
      // Lấy danh sách conversations
      const { conversations } = await chatService.getConversations(1, 1);
      
      if (conversations.length > 0) {
        // Sử dụng conversation đầu tiên
        const conv = conversations[0];
        setConversation(conv);
        
        // Join conversation room (sẽ được xử lý bởi useEffect khi conversation được set)
        // Không cần join ở đây vì useEffect sẽ tự động join
        
        // Chỉ load messages nếu chat đang mở
        if (isOpen) {
          setLoading(true);
          await loadMessages(conv._id);
          // Đánh dấu đã đọc
          await chatService.markMessagesAsRead(conv._id);
          setLoading(false);
        }
        
        loadUnreadCount();
      } else {
        // Chưa có conversation, sẽ tạo khi gửi message đầu tiên
        setConversation(null);
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
      setLoading(false);
    }
  };

  // Load messages
  const loadMessages = async (conversationId: string) => {
    try {
      const { messages: msgs } = await chatService.getMessages(conversationId, 1, 50);
      setMessages(msgs);
      scrollToBottom();
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  // Gửi message
  const handleSendMessage = async () => {
    if (!messageText.trim() || sending || !user?._id) return;

    try {
      setSending(true);

      let currentConversation = conversation;

      // Nếu chưa có conversation, tạo mới
      if (!currentConversation) {
        const result = await chatService.startConversation(messageText.trim());
        currentConversation = result.conversation;
        setConversation(currentConversation);
        
        // Join conversation room (sẽ được xử lý bởi useEffect khi conversation được set)
        // Đợi một chút để đảm bảo conversation state được update
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Không thêm message vào state ở đây vì sẽ nhận qua socket
        // Chỉ clear input
        setMessageText("");
        loadUnreadCount();
        return;
      }

      // Gửi message (message sẽ được nhận qua socket)
      await chatService.sendMessage(
        currentConversation._id,
        messageText.trim()
      );

      // Không thêm message vào state ở đây vì sẽ nhận qua socket
      setMessageText("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Không thể gửi tin nhắn. Vui lòng thử lại.");
    } finally {
      setSending(false);
    }
  };

  // Load unread count khi component mount
  useEffect(() => {
    if (user?._id) {
      loadUnreadCount();
      // Refresh unread count mỗi 30 giây
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user?._id]);

  // Đóng chat khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Format date và time đầy đủ (cho tooltip)
  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy HH:mm", { locale: vi });
    } catch {
      return "";
    }
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
  const getOtherParticipant = () => {
    if (!conversation) return null;
    return conversation.participants.find(
      (p) => p.userId._id !== user?._id
    )?.userId;
  };

  if (!user) {
    return null;
  }

  return (
    <div>
      {/* Nút bong bóng chat */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white flex items-center justify-center shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110 z-[1000] group ring-4 ring-purple-200/50"
      >
        <MessageCircle className="h-7 w-7 group-hover:scale-110 transition-transform duration-200" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse shadow-lg">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Cửa sổ chat */}
      {isOpen && (
        <div
          ref={chatRef}
          className="fixed bottom-24 right-6 w-96 h-[600px] bg-white shadow-2xl rounded-2xl overflow-hidden flex flex-col z-[1001] animate-in slide-in-from-bottom-4 fade-in duration-300 border border-gray-100 ring-1 ring-gray-200/50"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/30">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base">
                  {getOtherParticipant()?.fullName || "Hỗ trợ khách hàng"}
                </h3>
                <p className="text-xs text-white/90">
                  {socket?.connected ? "Đang trực tuyến" : "Đang kết nối..."}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 bg-white"
            style={{ background: "linear-gradient(to bottom, #fafafa 0%, #ffffff 100%)" }}
          >
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện!
              </div>
            ) : (
              messages.map((message, index) => {
                const isOwnMessage = typeof message.senderId === 'object' 
                  ? message.senderId._id === user._id 
                  : message.senderId === user._id;
                const showSenderName = !isOwnMessage && shouldShowTimestamp(message, index);
                
                return (
                  <div
                    key={message._id}
                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                    style={{
                      marginBottom: index > 0 ? 4 : 16,
                    }}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 relative shadow-sm transition-all duration-200 ${
                        isOwnMessage
                          ? "bg-purple-500 text-white"
                          : "bg-purple-100 text-gray-800"
                      }`}
                      title={formatDateTime(message.createdAt)}
                      style={{
                        wordWrap: "break-word",
                        overflowWrap: "break-word",
                      }}
                    >
                      {showSenderName && (
                        <p className={`text-xs font-semibold mb-1.5 ${isOwnMessage ? "text-white/90" : "text-purple-700"}`}>
                          {typeof message.senderId === 'object' 
                            ? message.senderId.fullName 
                            : 'Người dùng'}
                        </p>
                      )}
                      <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isOwnMessage ? "text-white" : "text-gray-800"}`}>
                        {message.content}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Nhập tin nhắn..."
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 text-sm transition-all duration-200"
                disabled={sending || loading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!messageText.trim() || sending || loading}
                className="w-11 h-11 rounded-full bg-purple-500 text-white flex items-center justify-center hover:bg-purple-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
              >
                {sending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

