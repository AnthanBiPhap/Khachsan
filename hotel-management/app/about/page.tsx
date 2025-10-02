'use client';

import { Building, MapPin, Phone, Mail, Clock, Users, Award, Heart, Coffee } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  const teamMembers = [
    {
      name: 'Nguyễn Ngô Hồng Ni',
      position: 'Quản lý Khách sạn',
      image: 'https://img.lovepik.com/photo/20211130/medium/lovepik-hotel-attendant-picture_501203514.jpg',
      description: 'Với hơn 10 năm kinh nghiệm trong ngành dịch vụ lưu trú'
    },
    {
      name: 'Dương Cẩm Nhung',
      position: 'Trưởng bộ phận Lễ tân',
      image: 'https://watermark.lovepik.com/photo/20211209/large/lovepik-hotel-front-desk-service-picture_501704753.jpg',
      description: 'Chuyên nghiệp, thân thiện và luôn sẵn sàng hỗ trợ quý khách'
    },
    {
      name: 'Nguyễn Thị Thanh Hương',
      position: 'Đầu bếp trưởng',
      image: 'https://img.freepik.com/premium-photo/female-asian-chef-restaurant-portrait-adult_53876-541043.jpg',
      description: 'Mang đến những bữa ăn ngon với hương vị đặc trưng Đà Nẵng'
    }
  ];

  const features = [
    {
      icon: <Building className="h-8 w-8 text-blue-600" />,
      title: 'Không gian sang trọng',
      description: 'Phòng ốc được thiết kế hiện đại, tiện nghi'
    },
    {
      icon: <Award className="h-8 w-8 text-blue-600" />,
      title: 'Chất lượng dịch vụ',
      description: 'Đạt chuẩn 4 sao với đội ngũ nhân viên chuyên nghiệp'
    },
    {
      icon: <Heart className="h-8 w-8 text-blue-600" />,
      title: 'Trải nghiệm tuyệt vời',
      description: 'Cam kết mang đến kỳ nghỉ đáng nhớ nhất cho quý khách'
    },
    {
      icon: <Coffee className="h-8 w-8 text-blue-600" />,
      title: 'Tiện ích đa dạng',
      description: 'Nhà hàng, bar, spa, hồ bơi và nhiều tiện ích khác'
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative h-96 w-full">
        <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Về Chúng Tôi</h1>
            <p className="text-xl">Khám phá câu chuyện và giá trị của Miko Hotel</p>
          </div>
        </div>
        <Image
          src="https://acihome.vn/uploads/15/thiet-ke-khach-san-ven-bien-dang-cap-nghi-duong-5-sao-tien-nghi-hien-dai-3.jpg"
          alt="Miko Hotel"
          fill
          className="object-cover"
          priority
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWVlZWUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzk5OSI+Q2hcdTFlYWRjIGNcdTFlYzNvIGhpbmggXHUxZTAzMW5oPC90ZXh0Pjwvc3ZnPg==';
          }}
        />
      </div>

      {/* Introduction */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Chào mừng đến với Miko Hotel</h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto mb-8"></div>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto">
            Tọa lạc tại trung tâm thành phố Đà Nẵng, Miko Hotel tự hào là điểm đến lý tưởng cho những ai yêu thích sự tiện nghi, sang trọng và phong cách phục vụ chuyên nghiệp. Với vị trí đắc địa, từ đây quý khách có thể dễ dàng khám phá những điểm đến du lịch nổi tiếng của thành phố biển xinh đẹp này.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mt-16">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Câu Chuyện Của Chúng Tôi</h3>
            <p className="text-gray-600 mb-4">
              Được thành lập vào năm 2015, Miko Hotel đã không ngừng phát triển và khẳng định vị thế là một trong những khách sạn hàng đầu tại Đà Nẵng. Chúng tôi bắt đầu với mong muốn mang đến cho du khách một không gian nghỉ dưỡng đẳng cấp, kết hợp giữa nét đẹp hiện đại và tinh thần phục vụ tận tâm.
            </p>
            <p className="text-gray-600">
              Trải qua nhiều năm hoạt động, Miko Hotel tự hào đã đón tiếp hàng trăm ngàn lượt khách trong và ngoài nước, nhận được nhiều đánh giá tích cực và giải thưởng uy tín trong ngành dịch vụ lưu trú.
            </p>
          </div>
          <div className="relative h-80 rounded-lg overflow-hidden shadow-xl">
            <Image
              src="https://katahome.com/wp-content/uploads/2018/10/thiet-ke-noi-that-phong-ngu-khach-san-5-sao-chuan-khong-can-chinh-4.jpg"
              alt="Lịch sử Miko Hotel"
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWVlZWUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzk5OSI+Q2hcdTFlYWRjIGNcdTFlYzNvIGhpbmggXHUxZTAzMW5oPC90ZXh0Pjwvc3ZnPg==';
              }}
            />
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tầm Nhìn & Sứ Mệnh</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-blue-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Tầm Nhìn</h3>
              <p className="text-gray-600">
                Trở thành khách sạn hàng đầu tại Đà Nẵng, là điểm đến lý tưởng cho du khách trong nước và quốc tế, góp phần quảng bá hình ảnh du lịch Việt Nam.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-blue-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Sứ Mệnh</h3>
              <p className="text-gray-600">
                Mang đến cho khách hàng những trải nghiệm nghỉ dưỡng tuyệt vời nhất với chất lượng phục vụ vượt trội, không gian sang trọng và tiện nghi hiện đại, tạo nên những kỷ niệm đáng nhớ cho mỗi chuyến đi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Tại Sao Chọn Chúng Tôi?</h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto mb-8"></div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Đội Ngũ Của Chúng Tôi</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto mb-8"></div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Đội ngũ nhân viên chuyên nghiệp, tận tâm luôn sẵn sàng phục vụ quý khách với tiêu chí "Khách hàng là thượng đế"
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <div className="relative h-64">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWVlZWUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzk5OSI+Q2hcdTFlYWRjIGNcdTFlYzNvIGhpbmggXHUxZTAzMW5oPC90ZXh0Pjwvc3ZnPg==';
                    }}
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-2">{member.position}</p>
                  <p className="text-gray-600 text-sm">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 px-4 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Bạn Có Câu Hỏi?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Đội ngũ chăm sóc khách hàng của chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="tel:0704627402" className="flex items-center justify-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors">
              <Phone className="h-5 w-5" />
              0704 627 402
            </a>
            <a href="mailto:info@mikohotel.com" className="flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white px-6 py-3 rounded-md font-medium hover:bg-white/10 transition-colors">
              <Mail className="h-5 w-5" />
              Gửi Email
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
