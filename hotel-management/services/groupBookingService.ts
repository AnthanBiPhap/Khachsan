import axios from 'axios';

const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const API_URL = `${API_ORIGIN.replace(/\/$/, '')}/api/v1`;

export interface CreateGroupBookingPayload {
  requesterId?: string;
  requesterName: string;
  requesterPhone: string;
  requesterEmail?: string;
  checkIn: string;
  checkOut: string;
  peopleCount: number;
  roomCount: number;
  notes?: string;
}

export interface GroupBooking {
  _id: string;
  requesterId?: {
    _id: string;
    fullName: string;
    email?: string;
    phoneNumber?: string;
  };
  requesterName: string;
  requesterPhone: string;
  requesterEmail?: string;
  checkIn: string;
  checkOut: string;
  peopleCount: number;
  roomCount: number;
  notes?: string;
  status:
    | 'pending_approval'
    | 'approved'
    | 'info_uploaded'
    | 'quoted'
    | 'awaiting_payment'
    | 'paid'
    | 'confirmed'
    | 'refund_requested'
    | 'refunded'
    | 'rejected'
    | 'cancelled';
  allocatedRoomIds?: Array<{
    _id: string;
    roomNumber: string;
    typeId?: {
      _id: string;
      name: string;
      pricePerNight: number;
    };
  }>;
  members?: Array<{
    fullName: string;
    idNumber?: string;
    dateOfBirth?: string;
    phoneNumber?: string;
    email?: string;
    isLeader?: boolean;
  }>;
  quoteAmount?: number;
  paymentLink?: string;
  refundRequestedAt?: string;
  refundProcessedAt?: string;
  refundAmount?: number;
  rejectedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const groupBookingService = {
  async createRequest(payload: CreateGroupBookingPayload) {
    try {
    const res = await axios.post(`${API_URL}/group-bookings`, payload);
      return res.data?.data;
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err?.message || 'Request failed';
      throw new Error(`${status ? `[${status}] ` : ''}${msg}`);
    }
  },

  async getById(id: string) {
    const res = await axios.get(`${API_URL}/group-bookings/${id}`);
    return res.data?.data;
  },

  async list(params?: Record<string, unknown>): Promise<GroupBooking[]> {
    const res = await axios.get(`${API_URL}/group-bookings`, { params });
    return res.data?.data || [];
  },

  async cancel(id: string, payload?: { reason?: string }) {
    const res = await axios.post(`${API_URL}/group-bookings/${id}/cancel`, payload);
    return res.data?.data;
  },

  async downloadTemplate(id: string): Promise<Blob> {
    const res = await axios.get(`${API_URL}/group-bookings/${id}/template`, {
      responseType: 'blob',
    });
    return res.data as Blob;
  },

  async uploadMembers(id: string, file: File) {
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await axios.post(`${API_URL}/group-bookings/${id}/upload`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data?.data;
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err?.message || 'Upload failed';
      throw new Error(`${status ? `[${status}] ` : ''}${msg}`);
    }
  },
};


