export interface BookingRef {
  _id: string;
  checkIn?: string;
  checkOut?: string;
  source?: "online" | "walk_in";
  guestInfo?: {
    fullName?: string;
    email?: string;
    phoneNumber?: string;
  };
  guests?: Array<{
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    isMainGuest?: boolean;
  }>;
}

export interface GroupBookingRef {
  _id: string;
  checkIn?: string;
  checkOut?: string;
  requesterName?: string;
  requesterPhone?: string;
  requesterEmail?: string;
  peopleCount?: number;
  roomCount?: number;
  quoteAmount?: number;
  status?: string;
  allocatedRoomIds?: Array<{
    _id: string;
    roomNumber?: string;
    typeId?: {
      name?: string;
      pricePerNight?: number;
    };
  }>;
  members?: Array<{
    fullName?: string;
    idNumber?: string;
    phoneNumber?: string;
    email?: string;
    isLeader?: boolean;
  }>;
}

export interface CustomerRef {
  _id: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
}

export type InvoiceStatus = "pending" | "paid" | "failed" | "refunded" | string;

export interface InvoiceItem {
  _id: string;
  bookingId?: BookingRef;
  groupBookingId?: GroupBookingRef;
  customerId?: CustomerRef;
  totalAmount: number;
  paidAmount?: number;
  remainingAmount?: number;
  paymentStatus?: 'pending' | 'partial_paid' | 'paid' | 'failed' | 'refunded' | 'refund_requested' | 'cancelled';
  status: InvoiceStatus;
  issuedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SimpleUser { _id: string; fullName?: string }
export interface SimpleBooking { _id: string; checkIn?: string; checkOut?: string }

export interface InvoicesFormProps {
  open: boolean;
  item?: InvoiceItem | null;
  onCancel: () => void;
  onSave: (values: Partial<InvoiceItem>) => Promise<void>;
  loading?: boolean;
}