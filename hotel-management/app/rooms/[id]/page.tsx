"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BookingServices from "@/components/booking-services";
import { message, Modal } from "antd";
import Loading from "@/app/loading";
import { User } from "@/services/authService";
import { RefreshCw } from "lucide-react";

interface RoomType {
  _id: string;
  name: string;
  pricePerNight: number;
  capacity: number;
  extraHourPrice?: number;
  maxExtendHours?: number;
}

interface Service {
  _id: string;
  name: string;
  description: string;
  basePrice: number;
  workingHours?: {
    startTime: string;
    endTime: string;
  };
  slots: string[];
  images: string[];
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Room {
  _id: string;
  roomNumber: string;
  typeId: RoomType;
  status: string;
  amenities: string[];
}

export default function RoomDetailPage({ params }: { params: { id: string } }) {
  const { id: roomId } = params;
  const router = useRouter();
  const storedUser =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const userData: User | null = storedUser ? JSON.parse(storedUser) : null;
  const searchParams = useSearchParams();

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [services, setServices] = useState<Service[]>([]);

  // Booking info
  const [checkIn, setCheckIn] = useState(searchParams?.get("checkIn") || "");
  const [checkOut, setCheckOut] = useState(searchParams?.get("checkOut") || "");
  const [extraHours, setExtraHours] = useState(0);
  const [guests, setGuests] = useState(
    Number(searchParams?.get("guests") || 1)
  );
  const [selectedServices, setSelectedServices] = useState<
    { serviceId: string; quantity: number }[]
  >([]);

  // Guest information
  const [guestInfo, setGuestInfo] = useState<Array<{
    fullName: string;
    idNumber: string;
    dateOfBirth: string;
    phoneNumber: string;
    email: string;
    isMainGuest: boolean;
  }>>([]);

  // Pricing info with birthday discount
  const [pricingInfo, setPricingInfo] = useState<{
    totalPrice: number;
    breakdown: Array<{ date: Date; price: number; isBirthday: boolean }>;
    discountApplied: boolean;
    discountAmount: number;
    newCustomerDiscount?: {
      applied: boolean;
      percentage: number;
      amount: number;
    };
  } | null>(null);

  // Load room
  useEffect(() => {
    if (!roomId) return;
    fetch(`/api/rooms/${roomId}`)
      .then((res) => res.json())
      .then((data) => {
        setRoom(data);
        // Init selectedServices

        setLoading(false);
      });
  }, [roomId]);

  // Initialize guest info when guests count changes
  useEffect(() => {
    const newGuestInfo = Array.from({ length: guests }, (_, index) => {
      // Preserve existing data if available
      const existingGuest = guestInfo[index];
      return {
        fullName: existingGuest?.fullName || "",
        idNumber: existingGuest?.idNumber || "",
        dateOfBirth: existingGuest?.dateOfBirth || "",
        phoneNumber: existingGuest?.phoneNumber || "",
        email: existingGuest?.email || "",
        isMainGuest: index === 0, // First guest is main guest by default
      };
    });
    setGuestInfo(newGuestInfo);
  }, [guests]);

  useEffect(() => {
    fetch("/api/services", {
      headers: {
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setServices(data || []);
      })
      .catch((error) => {
        console.error("❌ Error fetching services:", error);
        setServices([]);
      });
  }, []);

  // Tự động cập nhật dữ liệu dịch vụ mỗi 2 phút (thay vì 5 phút để test nhanh hơn)
  useEffect(() => {
    console.log("🔄 Starting polling for services updates...");
    const interval = setInterval(() => {
      console.log("🔄 Polling: Checking for services updates...");
      refreshServices();
    }, 2 * 60 * 1000); // 2 phút để dễ test

    return () => {
      console.log("🛑 Clearing polling interval");
      clearInterval(interval);
    };
  }, []);

  // Refresh dữ liệu khi user quay lại tab hoặc reload trang
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("👀 User returned to tab, refreshing services...");
        refreshServices();
      }
    };

    const handleFocus = () => {
      console.log("🎯 Window focused, refreshing services...");
      refreshServices();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const refreshServices = async () => {
    try {
      const response = await fetch(`/api/services?_t=${Date.now()}`, {
        headers: {
          "Cache-Control": "no-cache",
          "Pragma": "no-cache",
        },
      });
      const data = await response.json();
      setServices(data || []);
      console.log("✅ Dữ liệu dịch vụ đã được cập nhật tự động!");
    } catch (error) {
      console.error("❌ Error refreshing services:", error);
    }
  };
  const getNights = () => {
    if (!checkIn || !checkOut) return 1; // mặc định 1 đêm nếu thiếu
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1; // ít nhất 1 đêm
  };

  const getDays = () => {
    if (!checkIn || !checkOut) return 0;
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return diff > 0 ? diff / (1000 * 60 * 60 * 24) : 0;
  };

  // Memoize guestInfo string để tránh useEffect chạy lại không cần thiết
  const guestInfoString = useMemo(() => JSON.stringify(guestInfo), [guestInfo]);

  // Fetch pricing info with birthday discount
  useEffect(() => {
    const fetchPricingInfo = async () => {
      if (!room || !checkIn || !checkOut || guestInfo.length === 0 || !guestInfo[0]?.dateOfBirth) {
        setPricingInfo(null);
        return;
      }

      try {
        const response = await fetch(`http://localhost:8080/api/v1/bookings/price/calculate?${new URLSearchParams({
          roomId: room._id,
          checkIn: new Date(checkIn).toISOString(),
          checkOut: new Date(checkOut).toISOString(),
          customerId: userData?._id || '',
          guests: guestInfoString
        })}`);

        if (response.ok) {
          const data = await response.json();
          console.log('💰 Pricing info from API:', data?.data);
          setPricingInfo(data?.data || null);
        } else {
          setPricingInfo(null);
        }
      } catch (error) {
        console.error('Error fetching pricing info:', error);
        setPricingInfo(null);
      }
    };

    // Debounce để tránh gọi API quá nhiều lần
    const timeoutId = setTimeout(() => {
      fetchPricingInfo();
    }, 300); // Đợi 300ms sau khi dependencies thay đổi

    return () => clearTimeout(timeoutId);
  }, [room, checkIn, checkOut, guestInfoString, userData]);

  const totalPrice = useMemo(() => {
    if (!room) return 0;
    
    // Tính giá dịch vụ
    const serviceTotal = selectedServices.reduce((sum, s) => {
      const service = services.find((srv) => srv._id === s.serviceId);
      if (!service) return sum;
      return sum + s.quantity * (service.basePrice || 0);
    }, 0);
    
    // Tính giá extra hours
    const extraHoursPrice = (extraHours || 0) * (room.typeId.extraHourPrice || 0);
    
    // Nếu có pricing info với giảm giá, sử dụng giá đã giảm + extra hours
    if (pricingInfo) {
      const calculatedTotal = pricingInfo.totalPrice + serviceTotal + extraHoursPrice;
      console.log('💰 Frontend totalPrice calculation:', {
        pricingInfoTotalPrice: pricingInfo.totalPrice,
        serviceTotal,
        extraHoursPrice,
        calculatedTotal,
        birthdayDiscount: pricingInfo.discountAmount,
        newCustomerDiscount: pricingInfo.newCustomerDiscount?.amount,
      });
      return calculatedTotal;
    }

    // Nếu không có pricing info, tính giá bình thường + extra hours
    const nights = getNights();
    return (
      nights * (room.typeId.pricePerNight || 0) +
      extraHoursPrice +
      serviceTotal
    );
  }, [room, checkIn, checkOut, extraHours, selectedServices, services, pricingInfo]);

  // Tính giá thanh toán (50% tổng giá trị)
  const paymentAmount = useMemo(() => {
    return Math.round(totalPrice * 0.5);
  }, [totalPrice]);

  // Tính số tiền còn lại
  const remainingAmount = useMemo(() => {
    return totalPrice - paymentAmount;
  }, [totalPrice, paymentAmount]);

  // Validation function
  const validateGuestInfo = () => {
    const usedIdNumbers = new Set();
    const usedPhoneNumbers = new Set();
    
    for (let i = 0; i < guestInfo.length; i++) {
      const guest = guestInfo[i];
      
      // Validate required fields
      if (!guest.fullName.trim()) {
        message.error(`Vui lòng nhập họ tên cho khách ${i + 1}`);
        return false;
      }
      if (!guest.idNumber.trim()) {
        message.error(`Vui lòng nhập số CMND/CCCD cho khách ${i + 1}`);
        return false;
      }
      if (!guest.dateOfBirth || guest.dateOfBirth.trim() === '') {
        message.error(`Vui lòng nhập ngày sinh cho khách ${i + 1}`);
        return false;
      }
      
      // Kiểm tra độ tuổi >= 18
      const age = Math.floor((new Date().getTime() - new Date(guest.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      if (age < 18) {
        message.error(`Khách ${i + 1} (${guest.fullName}) phải từ 18 tuổi trở lên để đặt phòng`);
        return false;
      }
      
      if (!guest.phoneNumber.trim()) {
        message.error(`Vui lòng nhập số điện thoại cho khách ${i + 1}`);
        return false;
      }
      
      // Validate unique ID numbers
      if (usedIdNumbers.has(guest.idNumber)) {
        message.error(`Số CMND/CCCD của khách ${i + 1} đã được sử dụng bởi khách khác`);
        return false;
      }
      usedIdNumbers.add(guest.idNumber);
      
      // Validate unique phone numbers
      if (usedPhoneNumbers.has(guest.phoneNumber)) {
        message.error(`Số điện thoại của khách ${i + 1} đã được sử dụng bởi khách khác`);
        return false;
      }
      usedPhoneNumbers.add(guest.phoneNumber);
      
      // Validate ID number format (9-20 characters)
      if (guest.idNumber.length < 9 || guest.idNumber.length > 20) {
        message.error(`Số CMND/CCCD của khách ${i + 1} phải có từ 9-20 ký tự`);
        return false;
      }
      
      // Validate phone number format (6-20 characters)
      if (guest.phoneNumber.length < 6 || guest.phoneNumber.length > 20) {
        message.error(`Số điện thoại của khách ${i + 1} phải có từ 6-20 ký tự`);
        return false;
      }
    }
    return true;
  };

  const handleConfirmBooking = () => {
    if (!validateGuestInfo()) {
      return;
    }
    setIsModalOpen(true);
  };
  // Hàm parse checkIn với giờ mặc định 14h
  const getCheckInDate = () => {
    if (!checkIn) return new Date();
    const d = new Date(checkIn);
    d.setHours(14, 0, 0, 0); // nhận phòng 14h
    return d;
  };

  // Hàm parse checkOut với giờ mặc định 12h + cộng thêm extraHours
  const getCheckOutDate = () => {
    if (!checkOut) return new Date();
    const d = new Date(checkOut);
    d.setHours(12, 0, 0, 0); // trả phòng 12h
    if (extraHours && extraHours > 0) {
      d.setHours(d.getHours() + extraHours);
    }
    return d;
  };

  // Trong handlePayment - sử dụng Stripe Checkout để tránh tạo booking trùng lặp
  const handlePayment = async () => {
    if (!room) return;

    try {
      const checkInDate = getCheckInDate();
      const checkOutDate = getCheckOutDate();

      // Lưu thông tin đặt phòng vào localStorage để sử dụng sau khi thanh toán
      const bookingData = {
        roomId: room._id,
        roomName: `${room.roomNumber} - ${room.typeId.name}`,
        checkIn: checkInDate.toISOString(),
        checkOut: new Date(checkOutDate).toISOString(),
        extraHours: extraHours || 0,
        actualCheckOut: new Date(checkOutDate).toISOString(),
        guests: guestInfo, // Sử dụng mảng thông tin khách hàng mới
        guestCount: guests,
        totalPrice: totalPrice, // Tổng giá đầy đủ (bao gồm extra hours)
        paymentAmount: paymentAmount, // Số tiền thanh toán (50% tổng giá)
        services: selectedServices.map((s) => {
          const srv = services.find((srv) => srv._id === s.serviceId);
          return {
            serviceId: s.serviceId,
            quantity: s.quantity,
            name: srv?.name || "",
            price: srv?.basePrice || 0,
          };
        }),
        customerId: userData?._id,
      };

      localStorage.setItem('stripe_booking_data', JSON.stringify(bookingData));

      // Tạo Stripe Checkout Session
      const payload = {
        roomId: room._id,
        roomName: bookingData.roomName,
        totalPrice: paymentAmount, // Chỉ thanh toán 50%
        checkIn: checkInDate.toISOString(),
        checkOut: new Date(checkOutDate).toISOString(),
        guests: guestInfo, // Sử dụng mảng thông tin khách hàng
        guestCount: guests,
        nights: getNights(),
        customerEmail: userData?.email || '',
        customerId: userData?._id,
        services: bookingData.services,
      };

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Không thể tạo phiên thanh toán');
      }

      const { url } = await res.json();

      // Redirect đến Stripe Checkout
      window.location.href = url;
    } catch (err) {
      console.error(err);
      message.error(err instanceof Error ? err.message : 'Không thể tạo phiên thanh toán. Vui lòng thử lại.');
    }
  };

  if (loading) return <div className="p-6">Đang tải...</div>;
  if (!room)
    return <div className="p-6 text-red-500">Không tìm thấy phòng</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Room info and booking form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Back button */}
            <Button 
              onClick={() => router.back()}
              variant="outline"
              className="mb-4"
            >
              ← Quay lại
            </Button>

            {/* Room information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    Phòng {room.roomNumber}
                  </h1>
                  <h2 className="text-xl text-blue-600 font-semibold">
                    {room.typeId.name}
                  </h2>
                </div>
                <Badge
                  variant={room.status === "available" ? "default" : "destructive"}
                  className="text-sm px-3 py-1"
                >
                  {room.status === "available" ? "Có sẵn" : "Đang bận"}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">💰</span>
                  <span className="text-gray-600">Giá:</span>
                  <span className="font-semibold text-blue-600">
                    {room.typeId.pricePerNight.toLocaleString()} VNĐ/đêm
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">👥</span>
                  <span className="text-gray-600">Sức chứa:</span>
                  <span className="font-semibold">{room.typeId.capacity} người</span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Tiện ích có sẵn</h3>
                <div className="flex flex-wrap gap-2">
                  {room.amenities.map((amenity, idx) => (
                    <Badge key={idx} variant="secondary" className="px-3 py-1">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Booking form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">📅 Thông tin đặt phòng</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày nhận phòng
                    </label>
                    <Input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày trả phòng
                    </label>
                    <Input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số khách
                    </label>
                    <Select
                      value={guests.toString()}
                      onValueChange={(v) => setGuests(parseInt(v))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn số khách" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <SelectItem key={n} value={n.toString()}>
                            {n} khách
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {room?.typeId?.maxExtendHours && room?.typeId?.maxExtendHours > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ⏰ Thêm giờ (tối đa {room.typeId.maxExtendHours}h)
                    </label>
                    <div className="text-sm text-gray-500 mb-2">
                      {room.typeId.extraHourPrice?.toLocaleString()} VNĐ/giờ
                    </div>
                    <Select
                      value={extraHours.toString()}
                      onValueChange={(v) => setExtraHours(parseInt(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from(
                          { length: room?.typeId?.maxExtendHours ?? 0 + 1 },
                          (_, i) => (
                            <SelectItem key={i} value={i.toString()}>
                              {i} giờ
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* Guest Information section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">👥 Thông tin khách hàng</h3>
              <div className="space-y-4">
                {guestInfo.map((guest, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-800">
                        {guest.isMainGuest ? "👑 Khách chính" : `Khách ${index + 1}`}
                      </h4>
                      {index === 0 && (
                        <Badge variant="default" className="text-xs">
                          Người đặt phòng
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Họ và tên *
                        </label>
                        <Input
                          value={guest.fullName}
                          onChange={(e) => {
                            const newGuestInfo = [...guestInfo];
                            newGuestInfo[index].fullName = e.target.value;
                            setGuestInfo(newGuestInfo);
                          }}
                          placeholder="Nhập họ và tên"
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Số CMND/CCCD *
                        </label>
                        <Input
                          value={guest.idNumber}
                          onChange={(e) => {
                            const newGuestInfo = [...guestInfo];
                            newGuestInfo[index].idNumber = e.target.value;
                            setGuestInfo(newGuestInfo);
                          }}
                          placeholder="Nhập số CMND/CCCD (9-20 ký tự)"
                          className="w-full"
                          maxLength={20}
                        />
                        {guest.idNumber && (guest.idNumber.length < 9 || guest.idNumber.length > 20) && (
                          <p className="text-xs text-red-500 mt-1">
                            Số CMND/CCCD phải có từ 9-20 ký tự
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ngày sinh *
                        </label>
                        <Input
                          type="date"
                          value={guest.dateOfBirth || ""}
                          onChange={(e) => {
                            const newGuestInfo = [...guestInfo];
                            newGuestInfo[index].dateOfBirth = e.target.value;
                            setGuestInfo(newGuestInfo);
                          }}
                          placeholder="Chọn ngày sinh"
                          className="w-full"
                        />
                        {guest.dateOfBirth && (
                          <p className="text-xs text-gray-500 mt-1">
                            Tuổi: {Math.floor((new Date().getTime() - new Date(guest.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} tuổi
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Số điện thoại *
                        </label>
                        <Input
                          value={guest.phoneNumber}
                          onChange={(e) => {
                            const newGuestInfo = [...guestInfo];
                            newGuestInfo[index].phoneNumber = e.target.value;
                            setGuestInfo(newGuestInfo);
                          }}
                          placeholder="Nhập số điện thoại (6-20 ký tự)"
                          className="w-full"
                          maxLength={20}
                        />
                        {guest.phoneNumber && (guest.phoneNumber.length < 6 || guest.phoneNumber.length > 20) && (
                          <p className="text-xs text-red-500 mt-1">
                            Số điện thoại phải có từ 6-20 ký tự
                          </p>
                        )}
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <Input
                          type="email"
                          value={guest.email}
                          onChange={(e) => {
                            const newGuestInfo = [...guestInfo];
                            newGuestInfo[index].email = e.target.value;
                            setGuestInfo(newGuestInfo);
                          }}
                          placeholder="Nhập email (không bắt buộc)"
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Services section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">🛠️ Dịch vụ bổ sung</h3>
              <BookingServices services={services} onChange={setSelectedServices} />
            </div>
          </div>

          {/* Right column - Booking summary */}
          <div className="lg:col-span-1">
          <div className="fixed top-24 right- w-[350px]">

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">💳 Tóm tắt đặt phòng</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Phòng {room.roomNumber}</span>
                      <span className="font-medium">
                        {getNights()} đêm × {room.typeId.pricePerNight.toLocaleString()} VNĐ
                      </span>
                    </div>
                    {pricingInfo && pricingInfo.discountApplied && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>🎂 Giảm giá sinh nhật (50%)</span>
                        <span className="font-medium">
                          -{pricingInfo.discountAmount.toLocaleString()} VNĐ
                        </span>
                      </div>
                    )}
                    {pricingInfo && pricingInfo.newCustomerDiscount && pricingInfo.newCustomerDiscount.applied && (
                      <div className="flex justify-between text-sm text-blue-600">
                        <span>🎁 Khách hàng thân thiết ({pricingInfo.newCustomerDiscount.percentage}%)</span>
                        <span className="font-medium">
                          -{pricingInfo.newCustomerDiscount.amount.toLocaleString()} VNĐ
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {extraHours > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Thêm giờ</span>
                      <span className="font-medium">
                        {extraHours}h × {room.typeId.extraHourPrice?.toLocaleString()} VNĐ
                      </span>
                    </div>
                  )}

                  {selectedServices.length > 0 && (
                    <div className="border-t pt-3">
                      <div className="text-sm font-medium text-gray-700 mb-2">Dịch vụ bổ sung:</div>
                      {selectedServices.map((service) => {
                        const srv = services.find(s => s._id === service.serviceId);
                        return (
                          <div key={service.serviceId} className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">
                              {srv?.name} × {service.quantity}
                            </span>
                            <span className="font-medium">
                              {(srv?.basePrice || 0) * service.quantity} VNĐ
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-800">Tổng cộng:</span>
                      <span className="text-xl font-bold text-gray-800">
                        {totalPrice.toLocaleString()} VNĐ
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Thanh toán trước (50%):</span>
                      <span className="font-medium">
                        {paymentAmount.toLocaleString()} VNĐ
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>Còn lại (50%):</span>
                      <span>
                        {remainingAmount.toLocaleString()} VNĐ
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                    onClick={handleConfirmBooking}
                    disabled={!checkIn || !checkOut || guestInfo.length === 0}
                  >
                    🚀 Xác nhận & Thanh toán
                  </Button>
                  
                  {(!checkIn || !checkOut) && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Vui lòng chọn ngày nhận và trả phòng
                    </p>
                  )}
                  
                  {guestInfo.length === 0 && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Vui lòng nhập thông tin khách hàng
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        title="Xác nhận đặt phòng và thanh toán"
        open={isModalOpen}
        onOk={handlePayment}
        onCancel={() => setIsModalOpen(false)}
        okText="Thanh toán với Stripe"
        cancelText="Hủy"
      >
        <div className="space-y-3">
          {pricingInfo && pricingInfo.discountApplied && (
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <p className="text-sm text-green-700 font-medium">
                🎂 Chúc mừng sinh nhật! Bạn được giảm 50% giá phòng cho ngày sinh nhật
              </p>
              <p className="text-xs text-green-600 mt-1">
                Tiết kiệm: {pricingInfo.discountAmount.toLocaleString()} VNĐ
              </p>
            </div>
          )}
          {pricingInfo && pricingInfo.newCustomerDiscount && pricingInfo.newCustomerDiscount.applied && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700 font-medium">
                🎁 Khách hàng thân thiết! Bạn được giảm {pricingInfo.newCustomerDiscount.percentage}% giá phòng
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Tiết kiệm: {pricingInfo.newCustomerDiscount.amount.toLocaleString()} VNĐ
              </p>
            </div>
          )}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Tổng giá trị:</span>
              <span className="text-lg font-semibold">{totalPrice.toLocaleString()} VNĐ</span>
            </div>
            <div className="flex justify-between items-center text-blue-600">
              <span className="text-lg font-semibold">Thanh toán trước (50%):</span>
              <span className="text-xl font-bold">{paymentAmount.toLocaleString()} VNĐ</span>
            </div>
            <div className="flex justify-between items-center text-gray-500 text-sm">
              <span>Còn lại (50%):</span>
              <span>{remainingAmount.toLocaleString()} VNĐ</span>
            </div>
          </div>
          <p className="text-gray-600">
            Bạn sẽ được chuyển đến trang thanh toán an toàn của Stripe.
          </p>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 Sau khi thanh toán thành công, bạn sẽ nhận được email xác nhận đặt phòng.
            </p>
            <p className="text-sm text-blue-600 mt-1">
              ⚠️ 50% còn lại sẽ được thanh toán khi nhận phòng.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
