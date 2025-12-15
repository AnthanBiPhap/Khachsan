// aboutInfoService.ts
import axios from "axios";

const getApiUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  return `${cleanBaseUrl}/api/v1`;
};

const API_URL = getApiUrl();

export interface AboutInfo {
  _id: string;
  heroTitle: string;
  heroDescription: string;
  heroImage: string;
  stats: {
    yearsExperience: { number: string; label: string };
    rooms: { number: string; label: string };
    satisfiedCustomers: { number: string; label: string };
    averageRating: { number: string; label: string };
  };
  introduction: {
    title: string;
    description: string;
  };
  story: {
    title: string;
    paragraph1: string;
    paragraph2: string;
    image: string;
  };
  mission: {
    title: string;
    description: string;
  };
  vision: {
    title: string;
    description: string;
  };
  features: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  team: {
    title: string;
    description: string;
    members: Array<{
      name: string;
      position: string;
      image: string;
      description: string;
      email: string;
      linkedin: string;
    }>;
  };
  createdAt: string;
  updatedAt: string;
}

export const aboutInfoService = {
  async getAboutInfo(): Promise<AboutInfo> {
    try {
      const timestamp = Date.now();
      const response = await axios.get(`${API_URL}/about-info`, {
        params: { _t: timestamp },
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
      return response.data.data;
    } catch (error: any) {
      console.error("Error fetching about info:", error);
      throw new Error(
        error.response?.data?.message || "Không thể tải thông tin về chúng tôi"
      );
    }
  },
};

