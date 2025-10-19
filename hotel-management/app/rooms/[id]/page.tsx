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

  const totalPrice = useMemo(() => {
    if (!room) return 0;
    const nights = getNights(); // số đêm chuẩn

    // Tổng dịch vụ
    const serviceTotal = selectedServices.reduce((sum, s) => {
      const service = services.find((srv) => srv._id === s.serviceId);
      if (!service) return sum;
      return sum + s.quantity * (service.basePrice || 0);
    }, 0);

    return (
      nights * (room.typeId.pricePerNight || 0) +
      (extraHours || 0) * (room.typeId.extraHourPrice || 0) +
      serviceTotal
    );
  }, [room, checkIn, checkOut, extraHours, selectedServices, services]);

  const handleConfirmBooking = () => {
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
        guests,
        totalPrice,
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
        totalPrice,
        checkIn: checkInDate.toISOString(),
        checkOut: new Date(checkOutDate).toISOString(),
        guests,
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
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phòng {room.roomNumber}</span>
                    <span className="font-medium">
                      {getNights()} đêm × {room.typeId.pricePerNight.toLocaleString()} VNĐ
                    </span>
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
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold text-gray-800">Tổng cộng:</span>
                    <span className="text-xl font-bold text-blue-600">
                      {totalPrice.toLocaleString()} VNĐ
                    </span>
                  </div>
                  
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                    onClick={handleConfirmBooking}
                    disabled={!checkIn || !checkOut}
                  >
                    🚀 Xác nhận & Thanh toán
                  </Button>
                  
                  {(!checkIn || !checkOut) && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Vui lòng chọn ngày nhận và trả phòng
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
          <p className="text-lg font-semibold">
            Tổng tiền cần thanh toán: {totalPrice.toLocaleString()} VNĐ
          </p>
          <p className="text-gray-600">
            Bạn sẽ được chuyển đến trang thanh toán an toàn của Stripe.
          </p>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 Sau khi thanh toán thành công, bạn sẽ nhận được email xác nhận đặt phòng.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
