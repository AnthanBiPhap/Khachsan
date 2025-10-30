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


