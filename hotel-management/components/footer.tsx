"use client"

import { MapPin, Phone, Mail, Facebook, MessageSquare, MessageCircle } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company info */}
          <div>
            <div className="text-2xl font-bold text-blue-400 mb-4">Miko Hotel</div>
            <p className="text-gray-300 mb-4">
              Khách sạn đẳng cấp 5 sao với dịch vụ chuyên nghiệp và tiện nghi hiện đại.
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-gray-300">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="text-sm">Hùng Vương, Thanh Khê, Đà Nẵng</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Phone className="h-4 w-4 mr-2" />
                <span className="text-sm">1900 1234</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Mail className="h-4 w-4 mr-2" />
                <span className="text-sm">info@mikohotel.com</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4">Dịch vụ</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="#" className="hover:text-white">
                  Đặt phòng khách sạn
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Vé máy bay
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Tour du lịch
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Xe đưa đón
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="#" className="hover:text-white">
                  Trung tâm trợ giúp
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Liên hệ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Điều khoản sử dụng
                </a>
              </li>
            </ul>
          </div>

          {/* Liên hệ */}
          <div>
            <h3 className="font-semibold mb-4">Kết nối với chúng tôi</h3>
            <div className="space-y-4">
              <div className="flex space-x-4">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" 
                   className="text-gray-300 hover:text-white transition-colors">
                  <Facebook className="h-6 w-6" />
                </a>
                <a href="https://zalo.me" target="_blank" rel="noopener noreferrer"
                   className="text-gray-300 hover:text-blue-500 transition-colors">
                  <MessageSquare className="h-6 w-6" />
                </a>
                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer"
                   className="text-gray-300 hover:text-pink-500 transition-colors">
                  <MessageCircle className="h-6 w-6" />
                </a>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-300 mb-2">Hỗ trợ 24/7</p>
                <a href="tel:0905123456" className="text-white font-medium hover:underline">
                  0905 123 456
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Miko Hotel. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  )
}
