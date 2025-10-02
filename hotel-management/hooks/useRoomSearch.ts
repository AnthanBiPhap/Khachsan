import { useState } from 'react';
import { bookingService } from '@/services/bookingService';
import { Room } from '@/services/bookingService';

export const useRoomSearch = () => {
  const [checkIn, setCheckIn] = useState<string>('');
  const [checkOut, setCheckOut] = useState<string>('');
  const [guests, setGuests] = useState<number>(1);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const searchRooms = async () => {
    if (!checkIn || !checkOut) {
      setError('Vui lòng chọn ngày nhận phòng và ngày trả phòng');
      return;
    }

    if (new Date(checkIn) >= new Date(checkOut)) {
      setError('Ngày trả phòng phải sau ngày nhận phòng');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const rooms = await bookingService.checkRoomAvailability(checkIn, checkOut);
      setAvailableRooms(rooms);
    } catch (err) {
      setError('Đã có lỗi xảy ra khi tìm kiếm phòng');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    guests,
    setGuests,
    availableRooms,
    loading,
    error,
    searchRooms,
  };
};
