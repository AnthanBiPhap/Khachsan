'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Clock, Facebook, Instagram, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Footer } from '@/components/footer';
import { contactService } from '@/services/contactService';
import { contactInfoService, type ContactInfo } from '@/services/contactInfoService';
import { toast } from 'sonner';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    message: '',
    subject: 'general'
  });
  const [loading, setLoading] = useState(false);
  // Khởi tạo với null - chỉ lấy từ API, không hardcode
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) return;
    
    setLoading(true);
    
    try {
      await contactService.sendContact(formData);
      toast.success('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.');
      setFormData({ name: '', contact: '', message: '', subject: 'general' });
    } catch (error: any) {
      toast.error(error.message || 'Không thể gửi tin nhắn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const loadContactInfo = useCallback(async () => {
    try {
      setLoadingInfo(true);
      console.log('🔄 Loading contact info from API...');
      const info = await contactInfoService.getContactInfo();
      // Luôn cập nhật từ API - không dùng giá trị mặc định
      if (info) {
        console.log('✅ Loaded contact info from API:', info);
        console.log('📞 Phone number from API:', info.phone);
        // Force update bằng cách tạo object mới
        setContactInfo({ ...info });
      } else {
        console.warn('⚠️ API returned empty data');
      }
    } catch (error: any) {
      console.error('❌ Error loading contact info:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      // Hiển thị error message chi tiết hơn
      toast.error(error.message || 'Không thể tải thông tin liên hệ');
      // Không set giá trị mặc định - để user thấy lỗi hoặc loading
    } finally {
      setLoadingInfo(false);
    }
  }, []);

  useEffect(() => {
    // Load ngay lập tức
    loadContactInfo();
    
    // Reload mỗi 5 giây để cập nhật dữ liệu mới khi admin sửa (giảm từ 10s xuống 5s)
    const interval = setInterval(() => {
      console.log('🔄 Auto-reloading contact info...');
      loadContactInfo();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [loadContactInfo]);
  
  // Thêm listener để reload khi focus vào tab (khi user quay lại tab)
  useEffect(() => {
    const handleFocus = () => {
      console.log('👁️ Tab focused, reloading contact info...');
      loadContactInfo();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadContactInfo]);

  // Hiển thị loading hoặc đợi dữ liệu từ API
  if (loadingInfo && !contactInfo) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin liên hệ...</p>
        </div>
      </div>
    );
  }

  // Nếu không có dữ liệu sau khi load xong, hiển thị error với option retry
  if (!contactInfo && !loadingInfo) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <p className="text-red-600 font-semibold mb-2 text-lg">Không thể tải thông tin liên hệ từ server.</p>
          <p className="text-gray-600 text-sm mb-4">
            Vui lòng kiểm tra:
            <br />• Backend server đang chạy (http://localhost:8080)
            <br />• Kết nối mạng
            <br />• Mở Console (F12) để xem chi tiết lỗi
          </p>
          <div className="space-x-2">
            <Button 
              onClick={() => {
                setLoadingInfo(true);
                loadContactInfo();
              }} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              🔄 Thử lại
            </Button>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-gray-600 hover:bg-gray-700"
            >
              🔃 Reload trang
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Liên hệ với chúng tôi</h1>
          <p className="text-xl text-gray-600">Mọi thắc mắc xin vui lòng liên hệ qua thông tin dưới đây</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column - Contact Info */}
        <div className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
              <span className="mr-2">📞</span> Thông tin liên hệ
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <Phone className="h-5 w-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900">Điện thoại đặt phòng</h3>
                  <p className="text-gray-600">
                    <a href={`tel:${contactInfo.phone}`} className="hover:text-blue-600 transition-colors">
                        {contactInfo.phone}
                    </a>
                    <span className="text-sm text-green-600 ml-2">(Hỗ trợ 24/7)</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start pt-4">
                <Mail className="h-5 w-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900">Email</h3>
                  <a 
                    href={`mailto:${contactInfo.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {contactInfo.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start pt-4">
                <MapPin className="h-5 w-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900">Địa chỉ</h3>
                  <span className="text-gray-600">{contactInfo.address}</span>
                </div>
              </div>

              <div className="flex items-start pt-4">
                <Clock className="h-5 w-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900">Giờ làm việc</h3>
                  <p className="text-gray-600">{contactInfo.workingHours.reception}</p>
                  <p className="text-gray-600">{contactInfo.workingHours.onlineSupport}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Kết nối với chúng tôi</h2>
            <div className="flex space-x-4">
              {contactInfo.socialMedia.facebook && (
                <a 
                  href={contactInfo.socialMedia.facebook}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-6 w-6" />
                </a>
              )}
              {contactInfo.socialMedia.zalo && (
                <a 
                  href={contactInfo.socialMedia.zalo}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition-colors"
                  aria-label="Zalo"
                >
                  <MessageSquare className="h-6 w-6" />
                </a>
              )}
              {contactInfo.socialMedia.instagram && (
                <a 
                  href={contactInfo.socialMedia.instagram}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-pink-600 text-white p-3 rounded-full hover:bg-pink-700 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-6 w-6" />
                </a>
              )}
            </div>
            
            {contactInfo.zaloQR && (
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 mb-2">Quét mã Zalo</h3>
                <div className="bg-gray-100 p-4 rounded-lg inline-block">
                  <div className="relative w-32 h-32">
                    <Image
                      src={
                        contactInfo.zaloQR && contactInfo.zaloQR.startsWith('http')
                          ? contactInfo.zaloQR 
                          : contactInfo.zaloQR && contactInfo.zaloQR.startsWith('/uploads')
                          ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}${contactInfo.zaloQR}`
                          : '/zalo-qr.jpg' // Ảnh mặc định từ public folder
                      }
                      alt="Zalo QR Code"
                      fill
                      className="object-contain rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        // Fallback về ảnh mặc định nếu lỗi
                        target.src = '/zalo-qr.jpg';
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Contact Form & Map */}
        <div className="space-y-8">
          {/* Contact Form */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Gửi tin nhắn cho chúng tôi</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nhập họ và tên"
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">
                  Email / Số điện thoại <span className="text-red-500">*</span>
                </label>
                <Input
                  id="contact"
                  name="contact"
                  type="text"
                  required
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="Email hoặc số điện thoại"
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Chủ đề
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="booking">Đặt phòng</option>
                  <option value="service">Thắc mắc dịch vụ</option>
                  <option value="issue">Báo sự cố</option>
                  <option value="feedback">Góp ý</option>
                  <option value="general">Thông tin chung</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Nội dung <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Nội dung cần hỗ trợ..."
                  rows={5}
                  className="w-full"
                />
              </div>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? 'Đang gửi...' : 'Gửi tin nhắn'}
                </Button>
              </div>
            </form>
          </div>

          {/* Google Maps */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Vị trí của chúng tôi</h2>
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                src={contactInfo.mapEmbedUrl}
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                className="rounded-lg"
                title="Google Maps - Miko Hotel"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
