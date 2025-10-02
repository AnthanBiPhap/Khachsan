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
    const searchCheckIn = normalizeDate(checkIn);
    const searchCheckOut = normalizeDate(checkOut, true);

    // gọi BE lấy booking trong khoảng overlap
    const [{ rooms }, { bookings }] = await Promise.all([
      bookingService.getRooms(),
      bookingService.getBookings({
        startDate: searchCheckIn,
        endDate: searchCheckOut,
      }),
    ]);

    // Set để chứa các phòng đã bị book
    const bookedSet = new Set<string>();

    for (const booking of bookings) {
      if (booking.paymentStatus === "cancelled") continue;

      const bookingCheckIn = new Date(booking.checkIn);
      const bookingCheckOut = new Date(booking.checkOut);

      const isOverlap =
        bookingCheckIn < new Date(searchCheckOut) &&
        bookingCheckOut > new Date(searchCheckIn);

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
