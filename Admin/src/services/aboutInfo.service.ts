import { env } from "../constanst/getEnvs";
import { useAuthStore } from "../stores/authStore";

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

export const getAboutInfo = async (): Promise<AboutInfo> => {
  const res = await fetch(`${env.API_URL}/api/v1/about-info`);

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch about info");
  }

  const response = await res.json();
  return response.data;
};

export const updateAboutInfo = async (payload: any): Promise<AboutInfo> => {
  const tokens = useAuthStore.getState().tokens;
  if (!tokens?.accessToken) throw new Error("No access token");

  const res = await fetch(`${env.API_URL}/api/v1/about-info`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokens.accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to update about info");
  }

  const response = await res.json();
  return response.data;
};

