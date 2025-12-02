'use client';

import { Building, MapPin, Phone, Mail, Clock, Users, Award, Heart, Coffee, Star, Shield, Wifi, Car, UtensilsCrossed, Waves, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/footer';
import { useEffect, useState } from 'react';

export default function AboutPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    { number: '10+', label: 'Năm kinh nghiệm', icon: <Award className="h-6 w-6" /> },
    { number: '50+', label: 'Phòng nghỉ', icon: <Building className="h-6 w-6" /> },
    { number: '50K+', label: 'Khách hàng hài lòng', icon: <Heart className="h-6 w-6" /> },
    { number: '4.8', label: 'Đánh giá trung bình', icon: <Star className="h-6 w-6" /> }
  ];

  const teamMembers = [
    {
      name: 'Nguyễn Ngô Hồng Ni',
      position: 'Quản lý Khách sạn',
      image: 'https://img.lovepik.com/photo/20211130/medium/lovepik-hotel-attendant-picture_501203514.jpg',
      description: 'Với hơn 10 năm kinh nghiệm trong ngành dịch vụ lưu trú',
      social: { linkedin: '#', email: 'hongni@mikohotel.com' }
    },
    {
      name: 'Dương Cẩm Nhung',
      position: 'Trưởng bộ phận Lễ tân',
      image: 'https://watermark.lovepik.com/photo/20211209/large/lovepik-hotel-front-desk-service-picture_501704753.jpg',
      description: 'Chuyên nghiệp, thân thiện và luôn sẵn sàng hỗ trợ quý khách',
      social: { linkedin: '#', email: 'nhung@mikohotel.com' }
    },
    {
      name: 'Nguyễn Thị Thanh Hương',
      position: 'Đầu bếp trưởng',
      image: 'https://img.freepik.com/premium-photo/female-asian-chef-restaurant-portrait-adult_53876-541043.jpg',
      description: 'Mang đến những bữa ăn ngon với hương vị đặc trưng Đà Nẵng',
      social: { linkedin: '#', email: 'huong@mikohotel.com' }
    }
  ];

  const features = [
    {
      icon: <Building className="h-10 w-10 text-blue-600" />,
      title: 'Không gian sang trọng',
      description: 'Phòng ốc được thiết kế hiện đại, tiện nghi với view đẹp',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Award className="h-10 w-10 text-amber-600" />,
      title: 'Chất lượng dịch vụ',
      description: 'Đạt chuẩn 4 sao với đội ngũ nhân viên chuyên nghiệp',
      gradient: 'from-amber-500 to-orange-500'
    },
    {
      icon: <Heart className="h-10 w-10 text-pink-600" />,
      title: 'Trải nghiệm tuyệt vời',
      description: 'Cam kết mang đến kỳ nghỉ đáng nhớ nhất cho quý khách',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      icon: <Coffee className="h-10 w-10 text-emerald-600" />,
      title: 'Tiện ích đa dạng',
      description: 'Nhà hàng, bar, spa, hồ bơi và nhiều tiện ích khác',
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      icon: <Wifi className="h-10 w-10 text-purple-600" />,
      title: 'WiFi miễn phí',
      description: 'Kết nối internet tốc độ cao tại mọi khu vực',
      gradient: 'from-purple-500 to-indigo-500'
    },
    {
      icon: <Car className="h-10 w-10 text-red-600" />,
      title: 'Đưa đón sân bay',
      description: 'Dịch vụ đưa đón tận nơi, tiện lợi và an toàn',
      gradient: 'from-red-500 to-pink-500'
    },
    {
      icon: <UtensilsCrossed className="h-10 w-10 text-orange-600" />,
      title: 'Ẩm thực đa dạng',
      description: 'Nhà hàng phục vụ ẩm thực địa phương và quốc tế',
      gradient: 'from-orange-500 to-amber-500'
    },
    {
      icon: <Waves className="h-10 w-10 text-cyan-600" />,
      title: 'Hồ bơi ngoài trời',
      description: 'Hồ bơi vô cực với view biển tuyệt đẹp',
      gradient: 'from-cyan-500 to-blue-500'
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section - Enhanced */}
      <div className="relative h-[500px] md:h-[600px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70 z-10 flex items-center justify-center">
          <div className={`text-center text-white px-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex justify-center mb-4">
              <Sparkles className="h-12 w-12 text-yellow-400 animate-pulse" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
              Về Chúng Tôi
            </h1>
            <p className="text-xl md:text-2xl mb-8 font-light">Khám phá câu chuyện và giá trị của Miko Hotel</p>
            <div className="flex justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-blue-50 transition-all duration-300 hover:scale-105"
                onClick={() => window.location.href = '/rooms'}
              >
                Khám phá phòng
              </Button>
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-blue-50 transition-all duration-300 hover:scale-105"
                onClick={() => window.location.href = '/contact'}
              >
                Liên hệ ngay
              </Button>
            </div>
          </div>
        </div>
        <Image
          src="https://acihome.vn/uploads/15/thiet-ke-khach-san-ven-bien-dang-cap-nghi-duong-5-sao-tien-nghi-hien-dai-3.jpg"
          alt="Miko Hotel"
          fill
          className="object-cover scale-105 hover:scale-100 transition-transform duration-700"
          priority
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWVlZWUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzk5OSI+Q2hcdTFlYWRjIGNcdTFlYzNvIGhpbmggXHUxZTAzMW5oPC90ZXh0Pjwvc3ZnPg==';
          }}
        />
      </div>

      {/* Stats Section - New */}
      <section className="py-16 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 text-white -mt-1">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className={`text-center transform transition-all duration-500 hover:scale-110 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex justify-center mb-3 text-yellow-300">
                  {stat.icon}
                </div>
                <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-yellow-300 to-yellow-100 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-sm md:text-base text-blue-100 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-block mb-4">
            <Sparkles className="h-8 w-8 text-blue-600 animate-pulse" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Chào mừng đến với Miko Hotel
          </h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 mx-auto mb-8 rounded-full"></div>
          <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Tọa lạc tại trung tâm thành phố Đà Nẵng, Miko Hotel tự hào là điểm đến lý tưởng cho những ai yêu thích sự tiện nghi, sang trọng và phong cách phục vụ chuyên nghiệp. Với vị trí đắc địa, từ đây quý khách có thể dễ dàng khám phá những điểm đến du lịch nổi tiếng của thành phố biển xinh đẹp này.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mt-16">
          <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full"></div>
              <h3 className="text-3xl font-bold text-gray-900">Câu Chuyện Của Chúng Tôi</h3>
            </div>
            <p className="text-gray-600 mb-6 text-lg leading-relaxed">
              Được thành lập vào năm 2015, Miko Hotel đã không ngừng phát triển và khẳng định vị thế là một trong những khách sạn hàng đầu tại Đà Nẵng. Chúng tôi bắt đầu với mong muốn mang đến cho du khách một không gian nghỉ dưỡng đẳng cấp, kết hợp giữa nét đẹp hiện đại và tinh thần phục vụ tận tâm.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              Trải qua nhiều năm hoạt động, Miko Hotel tự hào đã đón tiếp hàng trăm ngàn lượt khách trong và ngoài nước, nhận được nhiều đánh giá tích cực và giải thưởng uy tín trong ngành dịch vụ lưu trú.
            </p>
            <div className="mt-8 flex gap-4">
              <div className="flex items-center gap-2 text-blue-600">
                <Shield className="h-5 w-5" />
                <span className="font-semibold">Đảm bảo chất lượng</span>
              </div>
              <div className="flex items-center gap-2 text-cyan-600">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">4.8/5 đánh giá</span>
              </div>
            </div>
          </div>
          <div className={`relative h-96 md:h-[450px] rounded-2xl overflow-hidden shadow-2xl group transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <Image
              src="https://katahome.com/wp-content/uploads/2018/10/thiet-ke-noi-that-phong-ngu-khach-san-5-sao-chuan-khong-can-chinh-4.jpg"
              alt="Lịch sử Miko Hotel"
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWVlZWUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzk5OSI+Q2hcdTFlYWRjIGNcdTFlYzNvIGhpbmggXHUxZTAzMW5oPC90ZXh0Pjwvc3ZnPg==';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </div>
      </section>

      {/* Mission & Vision - Enhanced */}
      <section className="bg-gradient-to-b from-white via-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-block mb-4">
              <Sparkles className="h-8 w-8 text-blue-600 animate-pulse" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Tầm Nhìn & Sứ Mệnh
            </h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className={`group bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-l-4 border-blue-600 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Tầm Nhìn</h3>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">
                Trở thành khách sạn hàng đầu tại Đà Nẵng, là điểm đến lý tưởng cho du khách trong nước và quốc tế, góp phần quảng bá hình ảnh du lịch Việt Nam.
              </p>
            </div>

            <div className={`group bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-l-4 border-cyan-600 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Sứ Mệnh</h3>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">
                Mang đến cho khách hàng những trải nghiệm nghỉ dưỡng tuyệt vời nhất với chất lượng phục vụ vượt trội, không gian sang trọng và tiện nghi hiện đại, tạo nên những kỷ niệm đáng nhớ cho mỗi chuyến đi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Enhanced */}
      <section className="py-20 px-4 max-w-7xl mx-auto bg-gradient-to-b from-white to-gray-50">
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-block mb-4">
            <Sparkles className="h-8 w-8 text-blue-600 animate-pulse" />
          </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Tại Sao Chọn Chúng Tôi?
            </h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`group relative text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 overflow-hidden ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500" style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))`, '--tw-gradient-from': feature.gradient.split(' ')[1], '--tw-gradient-to': feature.gradient.split(' ')[3] } as React.CSSProperties}></div>
              <div className="relative z-10">
                <div className="flex justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg`}>
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 transition-colors duration-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team - Enhanced */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-block mb-4">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Đội Ngũ Của Chúng Tôi
            </h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 mx-auto mb-8 rounded-full"></div>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Đội ngũ nhân viên chuyên nghiệp, tận tâm luôn sẵn sàng phục vụ quý khách với tiêu chí "Khách hàng là thượng đế"
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div 
                key={index} 
                className={`group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="p-8 text-center">
                  <div className="flex justify-center gap-4 mb-6">
                    <a href={member.social.linkedin} className="p-3 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors">
                      <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    </a>
                    <a href={`mailto:${member.social.email}`} className="p-3 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors">
                      <Mail className="h-6 w-6 text-blue-600" />
                    </a>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-blue-600 font-semibold mb-4 text-lg">{member.position}</p>
                  <p className="text-gray-600 leading-relaxed">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
