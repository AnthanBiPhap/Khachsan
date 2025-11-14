// bookingService.ts
import axios from "axios";

const API_URL = "http://localhost:8080/api/v1";

export interface Booking {
  _id: string;
  roomId: {
    _id: string;
    roomNumber: string;
    typeId: string;
  };
  checkIn: string;
  checkOut: string;
  guests: number;
  paymentStatus: string;
}

export interface Room {
  _id: string;
  roomNumber: string;
  typeId: {
    _id: string;
    name: string;
    pricePerNight: number;
    extraHourPrice: number;
    maxExtendHours: number;
    capacity: number;
  };
  status: "available" | "booked" | "maintenance";
  amenities: string[];
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Chuẩn hóa ngày
const normalizeDate = (date: string, endOfDay = false): string => {
  const d = new Date(date);
  if (endOfDay) {
    d.setHours(23, 59, 59, 999);
  } else {
    d.setHours(0, 0, 0, 0);
  }
  return d.toISOString(); // chuẩn ISO để gửi API
};

export const bookingService = {
  getBookings: async (params?: any): Promise<{ bookings: Booking[] }> => {
    const response = await axios.get(`${API_URL}/bookings`, { params });
    return response.data.data;
  },

  createBooking: async (payload: any) => {
    const response = await axios.post(`${API_URL}/bookings`, {
      ...payload,
      source: 'online',
    });
    return response.data;
  },

  updateBooking: async (id: string, payload: Record<string, unknown>) => {
    const response = await axios.put(`${API_URL}/bookings/${id}`, payload);
    return response.data;
  },

  getRooms: async (): Promise<{ rooms: Room[] }> => {
    const response = await axios.get(`${API_URL}/rooms`);
    return response.data.data;
  },

  /**
   * Check phòng khả dụng theo ngày và số khách
   */
  checkRoomAvailability: async (
    checkIn: string,
    checkOut: string,
    guests?: number
  ): Promise<Room[]> => {
    // Chuẩn hóa ngày check-in và check-out với giờ cụ thể
    // Check-in: 14:00, Check-out: 12:00
    const normalizeCheckIn = (dateStr: string): Date => {
      const d = new Date(dateStr);
      d.setHours(14, 0, 0, 0); // Check-in lúc 14:00
      return d;
    };

    const normalizeCheckOut = (dateStr: string): Date => {
      const d = new Date(dateStr);
      d.setHours(12, 0, 0, 0); // Check-out lúc 12:00
      return d;
    };

    const searchCheckIn = normalizeCheckIn(checkIn);
    const searchCheckOut = normalizeCheckOut(checkOut);

    // Mở rộng phạm vi tìm kiếm để bao gồm các booking có thể overlap
    // Tìm các booking có checkIn < searchCheckOut và checkOut > searchCheckIn
    const searchStart = new Date(searchCheckIn);
    searchStart.setDate(searchStart.getDate() - 1); // Tìm từ ngày trước đó
    searchStart.setHours(0, 0, 0, 0);
    
    const searchEnd = new Date(searchCheckOut);
    searchEnd.setDate(searchEnd.getDate() + 1); // Tìm đến ngày sau đó
    searchEnd.setHours(23, 59, 59, 999);

    // gọi BE lấy booking trong khoảng mở rộng
    const [{ rooms }, { bookings }] = await Promise.all([
      bookingService.getRooms(),
      bookingService.getBookings({
        startDate: searchStart.toISOString(),
        endDate: searchEnd.toISOString(),
      }),
    ]);

    // Set để chứa các phòng đã bị book
    const bookedSet = new Set<string>();

    for (const booking of bookings) {
      if (booking.paymentStatus === "cancelled") continue;

      const bookingCheckIn = new Date(booking.checkIn);
      const bookingCheckOut = new Date(booking.checkOut);

      // Kiểm tra overlap chính xác: booking1 và booking2 overlap khi
      // booking1.checkIn < booking2.checkOut AND booking1.checkOut > booking2.checkIn
      // Nhưng cần đảm bảo không overlap nếu checkOut của booking cũ <= checkIn của booking mới
      const isOverlap =
        bookingCheckIn < searchCheckOut &&
        bookingCheckOut > searchCheckIn;

      if (isOverlap && booking.roomId?._id) {
        bookedSet.add(booking.roomId._id);
      }
    }

    // lọc phòng khả dụng
    return rooms.filter((room) => {
      if (bookedSet.has(room._id)) return false;
      if (room.status !== "available") return false;
      if (guests && room.typeId.capacity < guests) return false;
      return true;
    });
  },
};
