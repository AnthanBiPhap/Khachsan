'use client';

import { Building, MapPin, Phone, Mail, Clock, Users, Award, Heart, Coffee, Star, Shield, Wifi, Car, UtensilsCrossed, Waves, Sparkles, Bed, Plane, Umbrella, Camera, Music, Dumbbell, Spa, Pool, Restaurant, Bar, ShoppingBag, Parking, ConciergeBell, Luggage, Calendar, MessageSquare, CreditCard, Key, Lock, ThumbsUp, CheckCircle, Gift } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/footer';
import { useEffect, useState, useCallback } from 'react';
import { aboutInfoService, type AboutInfo } from '@/services/aboutInfoService';
import { toast } from 'sonner';

// Helper function to map icon name to React component
const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    Building: <Building className="h-10 w-10 text-blue-600" />,
    Award: <Award className="h-10 w-10 text-amber-600" />,
    Heart: <Heart className="h-10 w-10 text-pink-600" />,
    Coffee: <Coffee className="h-10 w-10 text-emerald-600" />,
    Wifi: <Wifi className="h-10 w-10 text-purple-600" />,
    Car: <Car className="h-10 w-10 text-red-600" />,
    UtensilsCrossed: <UtensilsCrossed className="h-10 w-10 text-orange-600" />,
    Waves: <Waves className="h-10 w-10 text-cyan-600" />,
    Bed: <Bed className="h-10 w-10 text-indigo-600" />,
    MapPin: <MapPin className="h-10 w-10 text-red-600" />,
    Plane: <Plane className="h-10 w-10 text-sky-600" />,
    Umbrella: <Umbrella className="h-10 w-10 text-yellow-600" />,
    Camera: <Camera className="h-10 w-10 text-gray-600" />,
    Music: <Music className="h-10 w-10 text-purple-600" />,
    Dumbbell: <Dumbbell className="h-10 w-10 text-orange-600" />,
    Spa: <Spa className="h-10 w-10 text-pink-600" />,
    Pool: <Pool className="h-10 w-10 text-cyan-600" />,
    Restaurant: <Restaurant className="h-10 w-10 text-amber-600" />,
    Bar: <Bar className="h-10 w-10 text-rose-600" />,
    ShoppingBag: <ShoppingBag className="h-10 w-10 text-violet-600" />,
    Parking: <Parking className="h-10 w-10 text-slate-600" />,
    ConciergeBell: <ConciergeBell className="h-10 w-10 text-yellow-600" />,
    Luggage: <Luggage className="h-10 w-10 text-brown-600" />,
    Calendar: <Calendar className="h-10 w-10 text-blue-600" />,
    Clock: <Clock className="h-10 w-10 text-gray-600" />,
    Phone: <Phone className="h-10 w-10 text-green-600" />,
    Mail: <Mail className="h-10 w-10 text-blue-600" />,
    MessageSquare: <MessageSquare className="h-10 w-10 text-teal-600" />,
    CreditCard: <CreditCard className="h-10 w-10 text-indigo-600" />,
    Key: <Key className="h-10 w-10 text-yellow-600" />,
    Lock: <Lock className="h-10 w-10 text-gray-600" />,
    Shield: <Shield className="h-10 w-10 text-green-600" />,
    Star: <Star className="h-10 w-10 text-yellow-600" />,
    ThumbsUp: <ThumbsUp className="h-10 w-10 text-blue-600" />,
    CheckCircle: <CheckCircle className="h-10 w-10 text-green-600" />,
    Gift: <Gift className="h-10 w-10 text-red-600" />,
    Sparkles: <Sparkles className="h-10 w-10 text-yellow-600" />,
  };
  return iconMap[iconName] || <Building className="h-10 w-10 text-blue-600" />;
};

const getGradient = (iconName: string) => {
  const gradientMap: Record<string, string> = {
    Building: 'from-blue-500 to-cyan-500',
    Award: 'from-amber-500 to-orange-500',
    Heart: 'from-pink-500 to-rose-500',
    Coffee: 'from-emerald-500 to-teal-500',
    Wifi: 'from-purple-500 to-indigo-500',
    Car: 'from-red-500 to-pink-500',
    UtensilsCrossed: 'from-orange-500 to-amber-500',
    Waves: 'from-cyan-500 to-blue-500',
    Bed: 'from-indigo-500 to-purple-500',
    MapPin: 'from-red-500 to-pink-500',
    Plane: 'from-sky-500 to-blue-500',
    Umbrella: 'from-yellow-500 to-orange-500',
    Camera: 'from-gray-500 to-slate-500',
    Music: 'from-purple-500 to-pink-500',
    Dumbbell: 'from-orange-500 to-red-500',
    Spa: 'from-pink-500 to-rose-500',
    Pool: 'from-cyan-500 to-blue-500',
    Restaurant: 'from-amber-500 to-yellow-500',
    Bar: 'from-rose-500 to-pink-500',
    ShoppingBag: 'from-violet-500 to-purple-500',
    Parking: 'from-slate-500 to-gray-500',
    ConciergeBell: 'from-yellow-500 to-amber-500',
    Luggage: 'from-amber-500 to-orange-500',
    Calendar: 'from-blue-500 to-cyan-500',
    Clock: 'from-gray-500 to-slate-500',
    Phone: 'from-green-500 to-emerald-500',
    Mail: 'from-blue-500 to-cyan-500',
    MessageSquare: 'from-teal-500 to-cyan-500',
    CreditCard: 'from-indigo-500 to-purple-500',
    Key: 'from-yellow-500 to-amber-500',
    Lock: 'from-gray-500 to-slate-500',
    Shield: 'from-green-500 to-emerald-500',
    Star: 'from-yellow-500 to-amber-500',
    ThumbsUp: 'from-blue-500 to-cyan-500',
    CheckCircle: 'from-green-500 to-emerald-500',
    Gift: 'from-red-500 to-pink-500',
    Sparkles: 'from-yellow-500 to-amber-500',
  };
  return gradientMap[iconName] || 'from-blue-500 to-cyan-500';
};

export default function AboutPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [aboutInfo, setAboutInfo] = useState<AboutInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const loadAboutInfo = useCallback(async () => {
    try {
      setLoadingInfo(true);
      console.log('🔄 Loading about info from API...');
      const info = await aboutInfoService.getAboutInfo();
      if (info) {
        console.log('✅ Loaded about info from API:', info);
        setAboutInfo({ ...info });
      } else {
        console.warn('⚠️ API returned empty data');
      }
    } catch (error: any) {
      console.error('❌ Error loading about info:', error);
      toast.error(error.message || 'Không thể tải thông tin về chúng tôi');
    } finally {
      setLoadingInfo(false);
    }
  }, []);

  useEffect(() => {
    loadAboutInfo();
    
    const interval = setInterval(() => {
      loadAboutInfo();
    }, 5000);

    const handleFocus = () => {
      loadAboutInfo();
    };
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadAboutInfo]);

  // Loading state
  if (loadingInfo && !aboutInfo) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin về chúng tôi...</p>
        </div>
      </div>
    );
  }

  if (!aboutInfo) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-red-600 mb-4">Không thể tải thông tin về chúng tôi từ server.</p>
          <p className="text-gray-600 text-sm mb-4">
            Vui lòng kiểm tra:
            <br />- Backend server đang chạy (http://localhost:8080)
            <br />- Kết nối mạng
            <br />- Console (F12) để xem chi tiết lỗi
          </p>
          <Button onClick={() => loadAboutInfo()} className="bg-blue-600 hover:bg-blue-700">
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  // Map stats from API
  const stats = [
    { 
      number: aboutInfo.stats.yearsExperience.number, 
      label: aboutInfo.stats.yearsExperience.label, 
      icon: <Award className="h-6 w-6" /> 
    },
    { 
      number: aboutInfo.stats.rooms.number, 
      label: aboutInfo.stats.rooms.label, 
      icon: <Building className="h-6 w-6" /> 
    },
    { 
      number: aboutInfo.stats.satisfiedCustomers.number, 
      label: aboutInfo.stats.satisfiedCustomers.label, 
      icon: <Heart className="h-6 w-6" /> 
    },
    { 
      number: aboutInfo.stats.averageRating.number, 
      label: aboutInfo.stats.averageRating.label, 
      icon: <Star className="h-6 w-6" /> 
    }
  ];

  // Map team members from API
  const teamMembers = aboutInfo.team.members || [];

  // Map features from API
  const features = aboutInfo.features.map((feature) => ({
    icon: getIconComponent(feature.icon),
    title: feature.title,
    description: feature.description,
    gradient: getGradient(feature.icon)
  }));

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
              {aboutInfo.heroTitle}
            </h1>
            <p className="text-xl md:text-2xl mb-8 font-light">{aboutInfo.heroDescription}</p>
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
          src={aboutInfo.heroImage}
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
            {aboutInfo.introduction.title}
          </h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 mx-auto mb-8 rounded-full"></div>
          <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            {aboutInfo.introduction.description}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mt-16">
          <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full"></div>
              <h3 className="text-3xl font-bold text-gray-900">{aboutInfo.story.title}</h3>
            </div>
            <p className="text-gray-600 mb-6 text-lg leading-relaxed">
              {aboutInfo.story.paragraph1}
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              {aboutInfo.story.paragraph2}
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
              src={aboutInfo.story.image}
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
                <h3 className="text-2xl font-bold text-gray-900">{aboutInfo.mission.title}</h3>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">
                {aboutInfo.mission.description}
              </p>
            </div>

            <div className={`group bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-l-4 border-cyan-600 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{aboutInfo.vision.title}</h3>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">
                {aboutInfo.vision.description}
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
              {aboutInfo.team.title}
            </h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 mx-auto mb-8 rounded-full"></div>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {aboutInfo.team.description}
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
                    <a href={member.linkedin} className="p-3 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors">
                      <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    </a>
                    <a href={`mailto:${member.email}`} className="p-3 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors">
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
