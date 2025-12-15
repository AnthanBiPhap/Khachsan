import { env } from "../constanst/getEnvs";
import { useAuthStore } from "../stores/authStore";

export interface ContactInfo {
  _id?: string;
  phone: string;
  email: string;
  address: string;
  addressLink: string;
  workingHours: {
    reception: string;
    onlineSupport: string;
  };
  socialMedia: {
    facebook: string;
    zalo: string;
    instagram: string;
  };
  zaloQR: string;
  mapEmbedUrl: string;
  mapLink: string;
}

export const getContactInfo = async (): Promise<ContactInfo> => {
  const tokens = useAuthStore.getState().tokens;
  if (!tokens?.accessToken) throw new Error("No access token");

  const res = await fetch(`${env.API_URL}/api/v1/contact-info`, {
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch contact info");
  }

  const response = await res.json();
  return response.data;
};

export const updateContactInfo = async (
  payload: Partial<ContactInfo>
): Promise<ContactInfo> => {
  const tokens = useAuthStore.getState().tokens;
  if (!tokens?.accessToken) throw new Error("No access token");

  const res = await fetch(`${env.API_URL}/api/v1/contact-info`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokens.accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to update contact info");
  }

  const response = await res.json();
  return response.data;
};

// Upload file và trả về đường dẫn
export const uploadFile = async (file: File): Promise<string> => {
  const tokens = useAuthStore.getState().tokens;
  if (!tokens?.accessToken) throw new Error("No access token");

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${env.API_URL}/api/v1/contact-info/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Upload thất bại");
  }

  const response = await res.json();
  return response.data.path;
};


