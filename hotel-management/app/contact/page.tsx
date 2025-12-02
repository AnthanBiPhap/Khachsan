'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Clock, Facebook, Instagram, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Footer } from '@/components/footer';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    message: '',
    subject: 'general'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission logic
    console.log('Form submitted:', formData);
    alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.');
    setFormData({ name: '', contact: '', message: '', subject: 'general' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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
                    <a href="tel:+84912345678" className="hover:text-blue-600 transition-colors">
                        0704627402
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
                    href="mailto:info@mikohotel.com" 
                    className="text-blue-600 hover:underline"
                  >
                    info@mikohotel.com
                  </a>
                </div>
              </div>

              <div className="flex items-start pt-4">
                <MapPin className="h-5 w-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900">Địa chỉ</h3>
                  <a 
                    href="https://maps.app.goo.gl/example" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Thanh khê, Hùng Vương, Đà Nẵng
                  </a>
                </div>
              </div>

              <div className="flex items-start pt-4">
                <Clock className="h-5 w-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900">Giờ làm việc</h3>
                  <p className="text-gray-600">Lễ tân 24/7</p>
                  <p className="text-gray-600">Hỗ trợ online: 8:00 - 22:00 hàng ngày</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Kết nối với chúng tôi</h2>
            <div className="flex space-x-4">
              <a 
                href="https://facebook.com/mikohotel" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a 
                href="https://zalo.me/84912345678" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition-colors"
                aria-label="Zalo"
              >
                <MessageSquare className="h-6 w-6" />
              </a>
              <a 
                href="https://instagram.com/mikohotel" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-pink-600 text-white p-3 rounded-full hover:bg-pink-700 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-6 w-6" />
              </a>
            </div>
            
            <div className="mt-6">
              <h3 className="font-medium text-gray-900 mb-2">Quét mã Zalo</h3>
              <div className="bg-gray-100 p-4 rounded-lg inline-block">
                <div className="relative w-32 h-32">
                  <Image
                    src="/zalo-qr.jpg"
                    alt="Zalo QR Code"
                    fill
                    className="object-contain rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWVlZWUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzk5OSI+UUVSIENvZGU8L3RleHQ+PC9zdmc+';
                    }}
                  />
                </div>
              </div>
            </div>
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
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  Gửi tin nhắn
                </Button>
              </div>
            </form>
          </div>

          {/* Google Maps */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Vị trí của chúng tôi</h2>
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3834.641108987922!2d108.21948517490328!3d16.032187484641973!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314219ee598df9c5%3A0xaadb53409be7c909!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBLaeG6v24gdHLDumMgxJDDoCBO4bq1bmc!5e0!3m2!1svi!2s!4v1759427019279!5m2!1svi!2s"
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
            <div className="mt-4 text-center">
              <a 
                href="https://maps.app.goo.gl/example" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                Xem trên Google Maps →
              </a>
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
