"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Calendar, Clock, Bot, X, ExternalLink } from "lucide-react";

type LocationType = 'tham_quan' | 'an_uong' | 'the_thao' | 'phim_anh' | 'sach' | 'game' | 'du_lich' | 'thu_gian' | 'bao_tang' | 'vuon_quoc_gia';

interface Location {
  _id: string;
  name: string;
  type: LocationType;
  description: string;
  address: string;
  images: string[];
  ratingAvg: number;
  status: 'active' | 'hidden' | 'deleted';
  createdAt?: string;
  updatedAt?: string;
}

const typeMap = {
  tham_quan: { text: 'Tham quan', color: 'bg-blue-100 text-blue-800' },
  an_uong: { text: 'Ăn uống', color: 'bg-orange-100 text-orange-800' },
  the_thao: { text: 'Thể thao', color: 'bg-green-100 text-green-800' },
  phim_anh: { text: 'Phim ảnh', color: 'bg-purple-100 text-purple-800' },
  sach: { text: 'Sách', color: 'bg-yellow-100 text-yellow-800' },
  game: { text: 'Game', color: 'bg-pink-100 text-pink-800' },
  du_lich: { text: 'Du lịch', color: 'bg-teal-100 text-teal-800' },
  thu_gian: { text: 'Thư giãn', color: 'bg-indigo-100 text-indigo-800' },
  bao_tang: { text: 'Bảo tàng', color: 'bg-gray-100 text-gray-800' },
  vuon_quoc_gia: { text: 'Vườn quốc gia', color: 'bg-emerald-100 text-emerald-800' }
};

const statusMap = {
  active: { text: 'Đang hoạt động', color: 'bg-green-100 text-green-800' },
  hidden: { text: 'Tạm ẩn', color: 'bg-yellow-100 text-yellow-800' },
  deleted: { text: 'Đã xóa', color: 'bg-red-100 text-red-800' }
};

export default function LocationDetailPage({ params }: { params: { id: string } }) {
  const { id: locationId } = params;
  const router = useRouter();

  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChatGptModal, setShowChatGptModal] = useState(false);
  const [messages, setMessages] = useState<Array<{id: string, text: string, isUser: boolean, timestamp: Date}>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load location
  useEffect(() => {
    if (!locationId) return;

    const fetchLocation = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/v1/locations/${locationId}`);

        if (!response.ok) {
          throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
        }

        const result = await response.json();

        if (result.statusCode === 200 && result.data) {
          setLocation(result.data);
        } else {
          throw new Error(result.message || 'Không thể lấy thông tin địa điểm');
        }
      } catch (err) {
        console.error('Error fetching location:', err);
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tải thông tin địa điểm');
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, [locationId]);

  // Auto scroll to bottom when new message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Function to open ChatGPT modal
  const openChatGptModal = () => {
    setShowChatGptModal(true);
    // Thêm tin nhắn chào mừng
    if (messages.length === 0) {
      const welcomeMessage = {
        id: 'welcome',
        text: `Xin chào! Tôi là AI hướng dẫn viên du lịch. Tôi có thể giúp bạn tìm hiểu về ${location?.name}. Bạn muốn biết gì về địa điểm này?`,
        isUser: false,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  };

  // Function to send message to AI
  const sendMessage = async () => {
    if (!inputMessage.trim() || !location) return;

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
            name: location.name,
            address: location.address,
            type: typeMap[location.type]?.text || 'địa điểm tham quan'
          }
        })
      });

      const data = await response.json();
      
      // Không giới hạn độ dài tin nhắn AI, để AI trả lời đầy đủ
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

  // Function to open ChatGPT web in new tab
  const openChatGptWeb = () => {
    if (!location) return;
    
    const prompt = `Bạn là một hướng dẫn viên du lịch chuyên nghiệp. Hãy cung cấp thông tin chi tiết về địa điểm sau:

Tên địa điểm: ${location.name}
Địa chỉ: ${location.address}
Loại: ${typeMap[location.type]?.text || 'địa điểm tham quan'}

Vui lòng cung cấp:
1. Mô tả ngắn gọn về địa điểm (2-3 câu)
2. Những hoạt động có thể làm tại đây
3. Thời gian tốt nhất để tham quan
4. Lưu ý đặc biệt (nếu có)
5. Gợi ý kinh nghiệm tham quan

Trả lời bằng tiếng Việt, ngắn gọn và hữu ích.`;

    // Encode prompt for URL
    const encodedPrompt = encodeURIComponent(prompt);
    
    // Open ChatGPT web with the prompt
    const chatGptUrl = `https://chat.openai.com/?q=${encodedPrompt}`;
    window.open(chatGptUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/5"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-6 rounded-lg text-center">
          <h3 className="font-bold text-lg mb-2">Đã xảy ra lỗi</h3>
          <p className="mb-4">{error}</p>
          <Button
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50"
            onClick={() => router.back()}
          >
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6">
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-6 rounded-lg text-center">
          <h3 className="font-bold text-lg mb-2">Không tìm thấy địa điểm</h3>
          <p className="mb-4">Địa điểm bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <Button
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
            onClick={() => router.back()}
          >
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white shadow rounded-lg space-y-6">
      <Button onClick={() => router.back()}>← Quay lại</Button>

      {/* Header */}
      <div className="border-b pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{location.name}</h1>
            <div className="flex items-center gap-4 mb-3">
              <Badge className={typeMap[location.type].color}>
                {typeMap[location.type].text}
              </Badge>
              <Badge className={statusMap[location.status].color}>
                {statusMap[location.status].text}
              </Badge>
            </div>
            <div className="flex items-center text-gray-600 mb-2">
              <MapPin className="h-5 w-5 mr-2" />
              <span>{location.address}</span>
            </div>
            <div className="flex items-center">
              <div className="flex items-center mr-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(location.ratingAvg) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-lg font-semibold text-gray-700">
                  {location.ratingAvg.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Images */}
      {location.images && location.images.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Hình ảnh địa điểm</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {location.images.map((image, idx) => (
              <div key={idx} className="relative">
                <img
                  src={image}
                  alt={`${location.name} - Ảnh ${idx + 1}`}
                  className="w-full h-48 object-cover rounded-lg shadow-md"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Mô tả chi tiết</h2>
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-700 leading-relaxed">
            {location.description}
          </p>
        </div>
      </div>

      {/* Location Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Thông tin địa điểm</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Loại địa điểm:</span>
              <Badge className={typeMap[location.type].color}>
                {typeMap[location.type].text}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Địa chỉ:</span>
              <span className="text-right">{location.address}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Đánh giá trung bình:</span>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                <span className="font-semibold">{location.ratingAvg.toFixed(1)}/5</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Trạng thái:</span>
              <Badge className={statusMap[location.status].color}>
                {statusMap[location.status].text}
              </Badge>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Thông tin bổ sung</h2>
          <div className="space-y-3">
            <div className="flex items-center text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="text-sm">
                Ngày tạo: {location.createdAt ? new Date(location.createdAt).toLocaleDateString('vi-VN') : 'Không rõ'}
              </span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              <span className="text-sm">
                Cập nhật lần cuối: {location.updatedAt ? new Date(location.updatedAt).toLocaleDateString('vi-VN') : 'Không rõ'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ChatGPT Web Section */}
      <div className="border-t pt-6">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Bot className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">Hỏi AI về địa điểm này</h3>
          </div>
          <p className="text-gray-700 mb-4">
            Nhận thông tin chi tiết và gợi ý từ AI về địa điểm này
          </p>
          <div className="flex gap-3">
            <Button
              onClick={openChatGptModal}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Bot className="h-4 w-4 mr-2" />
              Hỏi trong trang
            </Button>
            {/* <Button
              onClick={openChatGptWeb}
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Mở ChatGPT
            </Button> */}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="border-t pt-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Khám phá thêm về địa điểm này để có trải nghiệm tốt nhất
        </div>
        <div className="space-x-2 flex items-center">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="h-10"
          >
            Quay lại danh sách
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 h-10"
            onClick={() => {
              // Mở Google Maps với địa chỉ của location
              const encodedAddress = encodeURIComponent(location.address);
              const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
              window.open(googleMapsUrl, '_blank');
            }}
          >
            <MapPin className="h-4 w-4 mr-2" />
            Xem trên bản đồ
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 h-10"
            onClick={() => {
              // Tìm và click vào chat bubble với retry logic
              const tryOpenChat = (attempts = 0) => {
                const chatBubble = document.querySelector('[data-chat-bubble]') as HTMLElement;
                if (chatBubble) {
                  chatBubble.click();
                  console.log('Chat bubble clicked successfully from location detail');
                } else if (attempts < 3) {
                  // Retry sau 500ms nếu không tìm thấy
                  setTimeout(() => tryOpenChat(attempts + 1), 500);
                } else {
                  // Fallback: tìm button chat khác
                  const chatButton = document.querySelector('button[class*="chat"], [class*="chat-bubble"]') as HTMLElement;
                  if (chatButton) {
                    chatButton.click();
                  } else {
                    // Nếu không tìm thấy, thông báo cho user
                    alert('Chat đang được khởi tạo, vui lòng thử lại sau vài giây...');
                  }
                }
              };
              
              tryOpenChat();
            }}
          >
            Liên hệ
          </Button>
        </div>
      </div>

      {/* ChatGPT Modal */}
      {showChatGptModal && (
        <div className="fixed inset-0 bg-blue-200 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center">
                <Bot className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold">Hỏi AI về {location?.name}</h3>
              </div>
              <Button
                onClick={() => setShowChatGptModal(false)}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 flex flex-col">
              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50 max-h-96">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-lg xl:max-w-xl px-4 py-3 rounded-2xl shadow-sm ${
                          message.isUser
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
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
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                          <span className="text-sm font-medium">AI đang suy nghĩ...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t bg-gradient-to-r from-white to-blue-50">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Nhập câu hỏi của bạn..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    disabled={isLoadingAI}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isLoadingAI}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isLoadingAI ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Đang gửi...</span>
                      </div>
                    ) : (
                      'Gửi'
                    )}
                  </Button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t bg-gradient-to-r from-gray-50 to-blue-50">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 font-medium">
                    💡 Gợi ý: Hỏi về hoạt động, thời gian tham quan, lưu ý đặc biệt
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        setMessages([]);
                        setInputMessage('');
                      }}
                      variant="outline"
                      size="sm"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl"
                    >
                      Xóa chat
                    </Button>
                    <Button
                      onClick={() => setShowChatGptModal(false)}
                      variant="outline"
                      size="sm"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl"
                    >
                      Đóng
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
