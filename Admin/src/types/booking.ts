interface User {
  _id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
}
export interface GuestInfo {
  fullName: string;
  phoneNumber: string;
  idNumber: string;
  age: number;
  email?: string;
  isMainGuest?: boolean;
  actualCheckIn?: string;  // thêm vào
  actualCheckOut?: string; // thêm vào
}
export interface BookingService {
  serviceId: string | { _id: string };
  name: string;
  price: number;
  quantity: number;
}

export interface Booking {
  _id: string;
  // Nếu khách có tài khoản thì customerId, nếu walk-in thì guests
  customerId?: User; 
  guests: GuestInfo[]; // Mảng khách hàng (bắt buộc)
  guestCount: number; // Số lượng khách
  roomId: Room;
  checkIn: string;
  checkOut: string;
  services?: BookingService[];
  totalPrice: number;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  notes?: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
  extendHours?: number;
  source?: 'online' | 'walk_in';
}
export interface RoomType {
  _id: string;
  name: string;
  pricePerNight: number;
  extraHourPrice?: number;
  maxExtendHours?: number;
  capacity: number;
}

export interface Room {
  _id: string;
  roomNumber: string;
  typeId?: RoomType;
  status: string;
  amenities?: string[];
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BookingFormProps {
  open: boolean;
  booking?: Booking | null;
  onCancel: () => void;
  onSave: (values: Partial<Booking>) => Promise<void>;
  loading?: boolean;
}
