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
  slots: string[];
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
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => {
        console.log("then((data)", data);
        setServices(data?.data);
      });
  }, []);
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

  // Trong handlePayment
  const handlePayment = async () => {
    if (!room) return;

    try {
      const checkInDate = getCheckInDate();
      const checkOutDate = getCheckOutDate();

      const payload = {
        roomId: room._id,
        checkIn: checkInDate.toISOString(),
        checkOut: new Date(checkOutDate).toISOString(), // gốc
        extendHours: extraHours || 0,
        actualCheckOut: new Date(checkOutDate).toISOString(), // đã cộng giờ
        guests,
        totalPrice,
        status: "pending",
        paymentStatus: "paid",
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

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      const data = await res.json();
      const { booking, invoice } = data?.data;
      message.success("Thanh toán và đặt phòng thành công!", 5000);
      setIsModalOpen(false);

      if (invoice?._id) {
        window.open(`/api/invoices/${invoice._id}/print`, "_blank");
      }

      setTimeout(() => {
        router.push(`/`);
      }, 5000);
    } catch (err) {
      console.error(err);
      message.error("Không thể tạo booking. Vui lòng thử lại.");
    }
  };

  if (loading) return <div className="p-6">Đang tải...</div>;
  if (!room)
    return <div className="p-6 text-red-500">Không tìm thấy phòng</div>;

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white shadow rounded-lg space-y-4">
      <Button onClick={() => router.back()}>← Quay lại</Button>
      <h2 className="text-2xl font-bold">
        Phòng {room.roomNumber} - {room.typeId.name}
      </h2>
      <p className="text-gray-600">
        Giá: {room.typeId.pricePerNight.toLocaleString()} VNĐ/đêm
      </p>
      <p className="text-gray-600">Sức chứa: {room.typeId.capacity} người</p>
      <p className="text-gray-600">
        Trạng thái:{" "}
        <Badge
          variant={room.status === "available" ? "default" : "destructive"}
        >
          {room.status === "available" ? "Có sẵn" : "Đang bận"}
        </Badge>
      </p>

      <div>
        <span className="font-medium">Tiện ích:</span>
        <div className="flex flex-wrap gap-2 mt-1">
          {room.amenities.map((amenity, idx) => (
            <Badge key={idx}>{amenity}</Badge>
          ))}
        </div>
      </div>

      {/* Booking inputs */}
      <div className="space-y-3 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium">Ngày nhận phòng</label>
            <Input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Ngày trả phòng</label>
            <Input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Số khách</label>
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
            <label className="block text-sm font-medium mb-2">
              Thêm giờ (tối đa {room.typeId.maxExtendHours}h) (
              {room.typeId.extraHourPrice?.toLocaleString()} VNĐ/h)
            </label>
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
        {/* Services */}
        <BookingServices services={services} onChange={setSelectedServices} />
      </div>

      {/* Sticky booking summary */}
      <div className="border-t-2 border-b-blue-50 fixed bottom-0 left-0 w-full bg-white p-4 shadow-t flex justify-between items-center z-50">
        <div>
          <span className="font-medium">Tổng tiền:</span>{" "}
          <span className="text-lg font-bold">
            {totalPrice.toLocaleString()} VNĐ
          </span>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={handleConfirmBooking}
        >
          Xác nhận
        </Button>
      </div>
      <Modal
        title="Xác nhận đặt phòng và thanh toán"
        open={isModalOpen}
        onOk={handlePayment}
        onCancel={() => setIsModalOpen(false)}
        okText="Thanh toán"
        cancelText="Hủy"
      >
        <p>Tổng tiền cần thanh toán: {totalPrice.toLocaleString()} VNĐ</p>
        <p>Bạn có chắc chắn muốn thanh toán không?</p>
      </Modal>
    </div>
  );
}
