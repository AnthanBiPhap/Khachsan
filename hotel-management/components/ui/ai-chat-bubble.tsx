"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Bot, X, Send, MessageCircle } from "lucide-react";
import { User } from "@/services/authService";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function AIChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Lấy thông tin user từ localStorage
  useEffect(() => {
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Auto scroll to bottom when new message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Function to generate personalized welcome message
  const generateWelcomeMessage = () => {
    if (!user) {
      return 'Xin chào! Tôi là AI hướng dẫn viên du lịch của Miko Hotel. Tôi có thể giúp bạn:\n\n• Tìm hiểu về các địa điểm tham quan\n• Gợi ý hoạt động du lịch\n• Hướng dẫn đặt phòng\n• Tư vấn dịch vụ khách sạn\n\nBạn muốn biết gì?';
    }

    const userName = user.fullName || 'bạn';
    let welcomeText = `Xin chào ${userName}! Tôi là AI hướng dẫn viên du lịch của Miko Hotel Đà Nẵng. `;
    
    if (user.preferences && user.preferences.length > 0) {
      welcomeText += `\n\nTôi thấy bạn quan tâm đến: ${user.preferences.join(', ')}. `;
      welcomeText += `Dựa trên sở thích của bạn, tôi có thể gợi ý:\n\n`;
      
      // Gợi ý dựa trên sở thích tại Đà Nẵng
      user.preferences.forEach(pref => {
        switch(pref) {
          case 'tham quan':
            welcomeText += '• Địa điểm tham quan nổi tiếng Đà Nẵng (Cầu Vàng, Bà Nà Hills, Chùa Linh Ứng)\n';
            break;
          case 'ăn uống':
            welcomeText += '• Nhà hàng và món ăn đặc sản Đà Nẵng (Bún bò Huế, Mì Quảng, Hải sản)\n';
            break;
          case 'thể thao':
            welcomeText += '• Hoạt động thể thao tại Đà Nẵng (Lướt sóng, Golf, Leo núi)\n';
            break;
          case 'phim ảnh':
            welcomeText += '• Rạp chiếu phim và giải trí tại Đà Nẵng\n';
            break;
          case 'sách':
            welcomeText += '• Thư viện và quán cà phê đọc sách Đà Nẵng\n';
            break;
          case 'game':
            welcomeText += '• Khu vui chơi game và giải trí tại Đà Nẵng\n';
            break;
          case 'du lịch':
            welcomeText += '• Tour du lịch Đà Nẵng (Hội An, Huế, Bà Nà Hills)\n';
            break;
          case 'thư giãn':
            welcomeText += '• Spa và dịch vụ thư giãn tại Miko Hotel Đà Nẵng\n';
            break;
          case 'thăm bảo tàng':
            welcomeText += '• Bảo tàng và di tích lịch sử Đà Nẵng (Bảo tàng Chăm, Bảo tàng Điêu khắc Chăm)\n';
            break;
          case 'thăm vườn quốc gia':
            welcomeText += '• Vườn quốc gia và thiên nhiên gần Đà Nẵng (Bà Nà - Núi Chúa)\n';
            break;
        }
      });
      
      welcomeText += '\nBạn muốn tìm hiểu về chủ đề nào?';
    } else {
      welcomeText += 'Tôi có thể giúp bạn:\n\n• Tìm hiểu về các địa điểm tham quan\n• Gợi ý hoạt động du lịch\n• Hướng dẫn đặt phòng\n• Tư vấn dịch vụ khách sạn\n\nBạn muốn biết gì?';
    }
    
    return welcomeText;
  };

  // Function to open AI chat
  const openAIChat = () => {
    setIsOpen(true);
    // Thêm tin nhắn chào mừng nếu chưa có
    if (messages.length === 0) {
      const welcomeMessage = {
        id: 'welcome',
        text: generateWelcomeMessage(),
        isUser: false,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  };

  // Function to send message to AI
  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoadingAI(true);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          locationInfo: {
            name: 'Miko Hotel Đà Nẵng',
            address: 'Đà Nẵng, Việt Nam',
            type: 'khách sạn và dịch vụ du lịch tại Đà Nẵng'
          },
          userPreferences: user?.preferences || []
        })
      });

      const data = await response.json();
      const aiResponse = data.response || 'Xin lỗi, tôi không thể trả lời câu hỏi này.';
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error calling AI:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Tự đóng chat khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-ai-chat-bubble]') && !target.closest('[data-ai-chat-modal]')) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div>
      {/* AI Chat Bubble Button */}
      <button
        data-ai-chat-bubble
        onClick={openAIChat}
        className="fixed bottom-6 right-24 w-16 h-16 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 hover:rotate-12 z-[1000] group"
      >
        <Bot className="h-7 w-7 group-hover:scale-110 transition-transform duration-200" />
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
        )}
      </button>

      {/* AI Chat Window */}
      {isOpen && (
        <div
          data-ai-chat-modal
          className="fixed bottom-24 right-24 w-[480px] h-[600px] bg-white shadow-2xl rounded-2xl overflow-hidden flex flex-col z-[1001] animate-in slide-in-from-bottom-4 fade-in duration-300 border border-gray-200"
        >
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-500 to-pink-600 text-white">
            <div className="flex items-center">
              <Bot className="h-6 w-6 mr-2" />
              <h3 className="text-lg font-semibold">AI Hướng dẫn viên</h3>
            </div>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-br from-gray-50 to-purple-50">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-lg xl:max-w-xl px-4 py-3 rounded-2xl shadow-sm ${
                      message.isUser
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>
                    <p className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isLoadingAI && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-800 border border-gray-200 px-4 py-3 rounded-2xl shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent"></div>
                      <span className="text-sm font-medium">AI đang suy nghĩ...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t bg-gradient-to-r from-white to-purple-50">
            <div className="flex space-x-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Nhập câu hỏi của bạn..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                disabled={isLoadingAI}
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoadingAI}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isLoadingAI ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Đang gửi...</span>
                  </div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Quick Suggestions - Luôn hiển thị nếu có preferences */}
          {user?.preferences && user.preferences.length > 0 && (
            <div className="p-2 border-t bg-gradient-to-r from-purple-50 to-pink-50 max-h-28 overflow-y-auto">
              <p className="text-[10px] text-gray-500 mb-1.5 px-1">💡 Gợi ý nhanh:</p>
              <div className="flex flex-wrap gap-1.5">
                {user.preferences.map((pref, index) => {
                  const suggestions: Record<string, string> = {
                    'tham quan': 'Gợi ý địa điểm tham quan nổi tiếng ở Đà Nẵng',
                    'ăn uống': 'Nhà hàng và món ăn đặc sản Đà Nẵng nào ngon?',
                    'thể thao': 'Hoạt động thể thao nào phù hợp tại Đà Nẵng?',
                    'phim ảnh': 'Rạp chiếu phim nào gần Miko Hotel Đà Nẵng?',
                    'sách': 'Thư viện hoặc quán cà phê đọc sách nào ở Đà Nẵng?',
                    'game': 'Khu vui chơi game nào thú vị tại Đà Nẵng?',
                    'du lịch': 'Tour du lịch Đà Nẵng nào hấp dẫn?',
                    'thư giãn': 'Spa và dịch vụ thư giãn nào tốt tại Miko Hotel?',
                    'thăm bảo tàng': 'Bảo tàng nào đáng tham quan ở Đà Nẵng?',
                    'thăm vườn quốc gia': 'Vườn quốc gia nào đẹp gần Đà Nẵng?'
                  };
                  
                  const question = suggestions[pref] || `Gợi ý về ${pref} tại Đà Nẵng`;
                  
                  return (
                    <button
                      key={index}
                      onClick={async () => {
                        // Tự động gửi câu hỏi
                        const userMessage = {
                          id: Date.now().toString(),
                          text: question,
                          isUser: true,
                          timestamp: new Date()
                        };

                        setMessages(prev => [...prev, userMessage]);
                        setIsLoadingAI(true);

                        try {
                          const response = await fetch('/api/ai-chat', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              message: question,
                              locationInfo: {
                                name: 'Miko Hotel Đà Nẵng',
                                address: 'Đà Nẵng, Việt Nam',
                                type: 'khách sạn và dịch vụ du lịch tại Đà Nẵng'
                              },
                              userPreferences: user?.preferences || []
                            })
                          });

                          const data = await response.json();
                          const aiResponse = data.response || 'Xin lỗi, tôi không thể trả lời câu hỏi này.';
                          
                          const aiMessage = {
                            id: (Date.now() + 1).toString(),
                            text: aiResponse,
                            isUser: false,
                            timestamp: new Date()
                          };

                          setMessages(prev => [...prev, aiMessage]);
                        } catch (error) {
                          console.error('Error calling AI:', error);
                          const errorMessage = {
                            id: (Date.now() + 1).toString(),
                            text: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.',
                            isUser: false,
                            timestamp: new Date()
                          };
                          setMessages(prev => [...prev, errorMessage]);
                        } finally {
                          setIsLoadingAI(false);
                        }
                      }}
                      disabled={isLoadingAI}
                      className="px-2 py-1 bg-white border border-purple-200 rounded-lg text-[10px] text-purple-600 hover:bg-purple-50 hover:border-purple-300 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
                    >
                      {pref}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Chat Footer */}
          <div className="p-3 border-t bg-gradient-to-r from-gray-50 to-purple-50">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-600 font-medium">
                💡 Gợi ý: Hỏi về địa điểm, dịch vụ, đặt phòng
              </p>
              <Button
                onClick={() => {
                  setMessages([]);
                  setInputMessage('');
                }}
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl text-xs"
              >
                Xóa chat
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
