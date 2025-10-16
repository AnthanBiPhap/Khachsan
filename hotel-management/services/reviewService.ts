import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1';

export interface Review {
  _id: string;
  roomId: string;
  customerId?: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export const reviewService = {
  listByRoom: async (roomId: string) => {
    const res = await axios.get(`${API_URL}/reviews`, { params: { roomId, sort_by: 'createdAt', sort_type: 'desc' } });
    return res.data.data.reviews || [];
  },
  create: async (payload: { roomId: string; rating: number; comment?: string; customerId?: string }) => {
    const res = await axios.post(`${API_URL}/reviews`, payload);
    return res.data;
  },
};


