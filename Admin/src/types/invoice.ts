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

export interface CustomerRef {
  _id: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
}

export type InvoiceStatus = "pending" | "paid" | "failed" | "refunded" | string;

export interface InvoiceItem {
  _id: string;
  bookingId: BookingRef;
  customerId?: CustomerRef;
  totalAmount: number;
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