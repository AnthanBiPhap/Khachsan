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
import "stream-chat-react/dist/css/v2/index.css";
import { User } from "@/services/authService";
import { MessageCircle } from "lucide-react";

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

        // 3. Mở channel với staff
        const channelRes = await fetch(`${API_BASE_URL}/api/v1/chat/staff`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: userData._id }),
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
      if (currentChannel) {
        currentChannel.stopWatching().catch(console.error);
      }
      if (chatClient) {
        chatClient.disconnectUser().catch(console.error);
      }
    };
  }, [userData?._id, userData?.fullName]);

  // Cleanup client khi component unmount
  useEffect(() => {
    return () => {
      if (client) {
        client.disconnectUser().catch(console.error);
      }
    };
  }, [client]);

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
        data-chat-bubble
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 hover:rotate-12 z-[1000] group"
      >
        <MessageCircle className="h-7 w-7 group-hover:scale-110 transition-transform duration-200" />
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4  rounded-full animate-pulse"></div>
        )}
      </button>

      {/* Cửa sổ chat */}
      {isOpen && !loading && client && channel && client.state && (
        <div
          ref={chatRef}
          className="fixed bottom-24 right-6 w-96 h-[500px] bg-white shadow-2xl rounded-2xl overflow-hidden flex flex-col z-[1001] animate-in slide-in-from-bottom-4 fade-in duration-300 border border-gray-200"
        >
          <Chat client={client} onError={(error) => {
            console.error("Stream Chat error:", error);
            // Có thể thêm logic để reconnect hoặc hiển thị thông báo lỗi
          }}>
            <Channel channel={channel}>
              <Window>
                <ChannelHeader />
                <MessageList />
                <MessageInput />
              </Window>
            </Channel>
          </Chat>
        </div>
      )}
    </div>
  );
}