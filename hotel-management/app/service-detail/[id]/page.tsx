"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Heart, Flower2, Clock, Clock3, Clock4, Clock5, Clock6, Clock7, Clock8, Clock9, Clock10, Clock11, Clock12, Bot, X } from "lucide-react";
import AIChatBubble from "@/components/ui/ai-chat-bubble";

type ServiceStatus = 'active' | 'hidden' | 'deleted';

interface Service {
  _id: string;
  name: string;
  description: string;
  basePrice: number;
  slots: string[];
  images: string[];
  status: ServiceStatus;
  createdAt?: string;
  updatedAt?: string;
}

const statusMap = {
  active: { text: 'Đang mở', color: 'bg-green-100 text-green-800' },
  hidden: { text: 'Tạm ẩn', color: 'bg-yellow-100 text-yellow-800' },
  deleted: { text: 'Đã xóa', color: 'bg-red-100 text-red-800' }
};

export default function ServiceDetailPage({ params }: { params: { id: string } }) {
  const { id: serviceId } = params;
  const router = useRouter();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChatGptModal, setShowChatGptModal] = useState(false);
  const [messages, setMessages] = useState<Array<{id: string, text: string, isUser: boolean, timestamp: Date}>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load service
  useEffect(() => {
    if (!serviceId) return;

    const fetchService = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/v1/services/${serviceId}`);

        if (!response.ok) {
          throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
        }

        const result = await response.json();

        if (result.statusCode === 200 && result.data) {
          setService(result.data);
        } else {
          throw new Error(result.message || 'Không thể lấy thông tin dịch vụ');
        }
      } catch (err) {
        console.error('Error fetching service:', err);
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tải thông tin dịch vụ');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceId]);

  // Hàm xử lý lỗi khi tải ảnh
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
    target.nextElementSibling?.classList.remove('hidden');
  };

  // Hàm lấy icon phù hợp cho từng loại dịch vụ
  const getServiceIcon = (serviceName: string) => {
    const name = serviceName.toLowerCase();
    if (name.includes('gym') || name.includes('thể hình')) return <Dumbbell className="h-12 w-12 text-blue-600" />;
    if (name.includes('spa') || name.includes('massage')) return <Flower2 className="h-12 w-12 text-pink-500" />;
    if (name.includes('pool') || name.includes('bơi')) return <div className="h-12 w-12 bg-cyan-500 rounded-full flex items-center justify-center"><span className="text-white font-bold">🏊</span></div>;
    return <Heart className="h-12 w-12 text-green-500" />;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getClockIcon = (index: number) => {
    const clocks = [
      <Clock3 key="3" className="h-4 w-4" />,
      <Clock4 key="4" className="h-4 w-4" />,
      <Clock5 key="5" className="h-4 w-4" />,
      <Clock6 key="6" className="h-4 w-4" />,
      <Clock7 key="7" className="h-4 w-4" />,
      <Clock8 key="8" className="h-4 w-4" />,
      <Clock9 key="9" className="h-4 w-4" />,
      <Clock10 key="10" className="h-4 w-4" />,
      <Clock11 key="11" className="h-4 w-4" />,
      <Clock12 key="12" className="h-4 w-4" />
    ];
    return clocks[index % clocks.length];
  };

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
        text: `Xin chào! Tôi là AI hướng dẫn viên du lịch. Tôi có thể giúp bạn tìm hiểu về ${service?.name}. Bạn muốn biết gì về dịch vụ này?`,
        isUser: false,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  };

  // Function to send message to AI
  const sendMessage = async () => {
    if (!inputMessage.trim() || !service) return;

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
            name: service.name,
            address: 'Đà Nẵng, Việt Nam',
            type: 'dịch vụ khách sạn'
          }
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

  if (!service) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6">
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-6 rounded-lg text-center">
          <h3 className="font-bold text-lg mb-2">Không tìm thấy dịch vụ</h3>
          <p className="mb-4">Dịch vụ bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
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
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-shrink-0">
            {getServiceIcon(service.name)}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{service.name}</h1>
            <div className="flex items-center gap-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusMap[service.status].color}`}>
                {statusMap[service.status].text}
              </span>
              <span className="text-2xl font-bold text-green-600">
                {formatPrice(service.basePrice)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Images */}
      {service.images && service.images.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Hình ảnh dịch vụ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {service.images.map((image, idx) => (
              <div key={idx} className="relative">
                <img
                  src={image}
                  alt={`${service.name} - Ảnh ${idx + 1}`}
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
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {service.description}
          </p>
        </div>
      </div>

      {/* Service Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Thông tin dịch vụ</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Giá cơ bản:</span>
              <span className="text-green-600 font-semibold">
                {formatPrice(service.basePrice)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Trạng thái:</span>
              <Badge className={statusMap[service.status].color}>
                {statusMap[service.status].text}
              </Badge>
            </div>
          </div>
        </div>

        {/* Time Slots */}
        {service.slots.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Khung giờ phục vụ</h2>
            <div className="grid grid-cols-2 gap-2">
              {service.slots.map((slot, index) => (
                <div key={index} className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg">
                  {getClockIcon(index)}
                  <span className="font-medium">{slot}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Timestamps */}
      {(service.createdAt || service.updatedAt) && (
        <div className="border-t pt-4">
          <h2 className="text-xl font-semibold mb-4">Thông tin bổ sung</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            {service.createdAt && (
              <div>
                <span className="font-medium">Ngày tạo:</span> {new Date(service.createdAt).toLocaleString('vi-VN')}
              </div>
            )}
            {service.updatedAt && (
              <div>
                <span className="font-medium">Cập nhật lần cuối:</span> {new Date(service.updatedAt).toLocaleString('vi-VN')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ChatGPT Web Section */}
      <div className="border-t pt-6">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Bot className="h-6 w-6 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">Hỏi AI về dịch vụ này</h3>
          </div>
          <p className="text-gray-700 mb-4">
            Nhận thông tin chi tiết và gợi ý từ AI về dịch vụ này
          </p>
          <Button
            onClick={openChatGptModal}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            <Bot className="h-4 w-4 mr-2" />
            Nói chuyện với AI
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="border-t pt-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Nếu bạn muốn đặt dịch vụ này, hãy liên hệ trực tiếp với khách sạn
        </div>
        <div className="space-x-2">
          <Button
            onClick={() => router.back()}
            variant="outline"
          >
            Quay lại danh sách
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              // Tìm và click vào chat bubble với retry logic
              const tryOpenChat = (attempts = 0) => {
                const chatBubble = document.querySelector('[data-chat-bubble]') as HTMLElement;
                if (chatBubble) {
                  chatBubble.click();
                  console.log('Chat bubble clicked successfully from service detail');
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
            Liên hệ đặt dịch vụ
          </Button>
        </div>
      </div>
      <AIChatBubble />

      {/* ChatGPT Modal */}
      {showChatGptModal && (
        <div className="fixed inset-0 bg-purple-200 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center">
                <Bot className="h-6 w-6 text-purple-600 mr-2" />
                <h3 className="text-lg font-semibold">Hỏi AI về {service?.name}</h3>
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
              <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-br from-gray-50 to-purple-50 max-h-96">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-lg xl:max-w-xl px-4 py-3 rounded-2xl shadow-sm ${
                          message.isUser
                            ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
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
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
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
              <div className="p-4 border-t bg-gradient-to-r from-gray-50 to-purple-50">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 font-medium">
                    💡 Gợi ý: Hỏi về giá cả, khung giờ, lợi ích dịch vụ
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
