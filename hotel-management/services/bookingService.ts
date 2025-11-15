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
   * Sử dụng API backend để đảm bảo kiểm tra đầy đủ cả GroupBookings
   */
  checkRoomAvailability: async (
    checkIn: string,
    checkOut: string,
    guests?: number,
    extendHours: number = 0
  ): Promise<Room[]> => {
    try {
      // Gọi API backend để lấy danh sách phòng available
      // API này đã kiểm tra đầy đủ cả Bookings và GroupBookings
      const response = await axios.get(`${API_URL}/rooms/available`, {
        params: {
          checkIn,
          checkOut,
          extendHours,
        },
      });

      const availableRooms = response.data.data?.rooms || [];

      // Lọc theo số khách nếu có yêu cầu
      if (guests) {
        return availableRooms.filter((room: Room) => {
          return room.typeId.capacity >= guests;
        });
      }

      return availableRooms;
    } catch (error) {
      console.error("Error checking room availability:", error);
      throw error;
    }
  },
};
