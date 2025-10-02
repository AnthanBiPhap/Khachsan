export interface ServiceRef {
  _id: string;
  name?: string;
  unit?: string; // Thêm trường unit cho đơn vị tính
}

export interface BookingRef {
  _id: string;
  roomId?: {
    _id: string;
    roomNumber?: string;
    typeId?: {
      _id: string;
      name?: string;
    };
  };
  guestInfo?: {
    fullName?: string;
    phoneNumber?: string;
    email?: string;
  };
}

export interface UserRef {
  _id: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
}

export interface ServiceBookingItem {
  _id: string;
  bookingId?: BookingRef | null;
  serviceId?: ServiceRef | null;
  customerId?: UserRef | null;
  scheduledAt: string; // ISO
  quantity: number;
  price: number;
  status: "reserved" | "completed" | "cancelled" | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceBookingsFormProps {
  open: boolean;
  item?: ServiceBookingItem | null;
  onCancel: () => void;
  onSave: (values: Partial<ServiceBookingItem>) => Promise<void>;
  loading?: boolean;
}
export interface SimpleRef { _id: string; name?: string; fullName?: string }
