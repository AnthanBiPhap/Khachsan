export type InvoiceItemType = "room" | "service" | "late_fee" | "other" | string;

export interface InvoiceRef {
  _id: string;
  bookingId?: string;
  customerId?: string;
  totalAmount?: number;
  status?: string;
}

export interface InvoiceItemEntry {
  _id: string;
  invoiceId: InvoiceRef;
  itemType: InvoiceItemType;
  description: string;
  amount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SimpleInvoice { _id: string; totalAmount?: number; status?: string }

export interface InvoiceItemsFormProps {
  open: boolean;
  item?: InvoiceItemEntry | null;
  onCancel: () => void;
  onSave: (values: Partial<InvoiceItemEntry>) => Promise<void>;
  loading?: boolean;
}
