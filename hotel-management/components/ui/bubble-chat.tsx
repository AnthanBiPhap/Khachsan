"use client";

import { useEffect, useState, useRef } from "react";
import { StreamChat } from "stream-chat";
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageList,
  MessageInput,
  Window,
} from "stream-chat-react";
import { motion, AnimatePresence } from "framer-motion";
import "stream-chat-react/dist/css/v2/index.css";
import { User } from "@/services/authService";

export default function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [client, setClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const chatRef = useRef<HTMLDivElement>(null);

  // Lấy user từ localStorage
  const storedUser =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const userData: User | null = storedUser ? JSON.parse(storedUser) : null;

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

  // Khởi tạo chat ngay khi component mount
  useEffect(() => {
    if (!userData?._id) {
      setLoading(false);
      return;
    }

    let chatClient: StreamChat | null = null;

    const init = async () => {
      try {
        // 1. Lấy token từ backend
        const tokenRes = await fetch(`${API_BASE_URL}/api/v1/chat/token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userData._id,
            name: userData.fullName,
          }),
        });

        if (!tokenRes.ok) throw new Error("Không lấy được token");
        const { token, apiKey, user } = await tokenRes.json();

        // 2. Connect tới Stream
        chatClient = StreamChat.getInstance(apiKey);
        await chatClient.connectUser(user, token);

        // 3. Tạo/mở channel với admin
        const adminId = "68dcbc941c2f49bbfc7e6ed2"; // id admin fix cứng
        const channelRes = await fetch(`${API_BASE_URL}/api/v1/chat/open`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ adminId, userId: userData._id }),
        });

        if (!channelRes.ok) throw new Error("Không mở được channel");

        const { channelId } = await channelRes.json();
        const ch = chatClient.channel("messaging", channelId);
        await ch.watch();

        setClient(chatClient);
        setChannel(ch);
      } catch (err) {
        console.error("Chat init error:", err);
      } finally {
        setLoading(false);
      }
    };

    init();

    return () => {
      if (chatClient) chatClient.disconnectUser().catch(console.error);
    };
  }, [userData?._id, userData?.fullName]);

  // Tự đóng chat khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [chatRef]);

  return (
    <div>
      {/* Nút bong bóng chat */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ zIndex: 1000, bottom: "120px" }}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg"
      >
        💬
      </button>

      {/* Cửa sổ chat */}
      <AnimatePresence>
        {isOpen && !loading && client && channel && (
          <motion.div
            ref={chatRef}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-20 right-6 w-96 h-[500px] bg-white shadow-2xl rounded-2xl overflow-hidden flex flex-col z-[1001]"
          >
            <Chat client={client}>
              <Channel channel={channel}>
                <Window>
                  <ChannelHeader />
                  <MessageList />
                  <MessageInput />
                </Window>
              </Channel>
            </Chat>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}