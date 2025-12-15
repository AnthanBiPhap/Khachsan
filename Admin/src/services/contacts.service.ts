import { env } from "../constanst/getEnvs";
import { useAuthStore } from "../stores/authStore";

export interface Contact {
  _id: string;
  name: string;
  contact: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  repliedAt?: string;
  repliedBy?: {
    _id: string;
    fullName: string;
    email: string;
  };
  replyMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export const fetchContacts = async (
  page = 1,
  limit = 10,
  filters?: {
    name?: string;
    contact?: string;
    subject?: string;
    status?: string;
  }
) => {
  try {
    const tokens = useAuthStore.getState().tokens;
    if (!tokens?.accessToken) throw new Error("No access token");

    let url = `${env.API_URL}/api/v1/contacts?page=${page}&limit=${limit}`;
    
    if (filters?.name) url += `&name=${encodeURIComponent(filters.name)}`;
    if (filters?.contact) url += `&contact=${encodeURIComponent(filters.contact)}`;
    if (filters?.subject) url += `&subject=${encodeURIComponent(filters.subject)}`;
    if (filters?.status) url += `&status=${encodeURIComponent(filters.status)}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch contacts");
    }

    const response = await res.json();
    const { data } = response;

    return {
      data: data?.contacts || [],
      pagination: {
        page: data?.pagination?.page ?? page,
        limit: data?.pagination?.limit ?? limit,
        total: data?.pagination?.totalRecord ?? 0,
      },
    };
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return { data: [], pagination: { page, limit, total: 0 } };
  }
};

export const getContactById = async (id: string): Promise<Contact> => {
  const tokens = useAuthStore.getState().tokens;
  if (!tokens?.accessToken) throw new Error("No access token");

  const res = await fetch(`${env.API_URL}/api/v1/contacts/${id}`, {
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch contact");
  }

  const response = await res.json();
  return response.data;
};

export const createContact = async (
  payload: {
    name: string;
    contact: string;
    subject: string;
    message: string;
    status?: string;
  }
): Promise<Contact> => {
  const tokens = useAuthStore.getState().tokens;
  if (!tokens?.accessToken) throw new Error("No access token");

  const res = await fetch(`${env.API_URL}/api/v1/contacts/admin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokens.accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to create contact");
  }

  const response = await res.json();
  return response.data;
};

export const updateContact = async (
  id: string,
  payload: {
    name?: string;
    contact?: string;
    subject?: string;
    message?: string;
    status?: string;
    replyMessage?: string;
  }
): Promise<Contact> => {
  const tokens = useAuthStore.getState().tokens;
  if (!tokens?.accessToken) throw new Error("No access token");

  const res = await fetch(`${env.API_URL}/api/v1/contacts/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokens.accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to update contact");
  }

  const response = await res.json();
  return response.data;
};

export const markContactAsRead = async (id: string): Promise<Contact> => {
  const tokens = useAuthStore.getState().tokens;
  if (!tokens?.accessToken) throw new Error("No access token");

  const res = await fetch(`${env.API_URL}/api/v1/contacts/${id}/read`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to mark as read");
  }

  const response = await res.json();
  return response.data;
};

export const deleteContact = async (id: string): Promise<void> => {
  const tokens = useAuthStore.getState().tokens;
  if (!tokens?.accessToken) throw new Error("No access token");

  const res = await fetch(`${env.API_URL}/api/v1/contacts/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to delete contact");
  }
};

export const getNewContactsCount = async (): Promise<number> => {
  try {
    const tokens = useAuthStore.getState().tokens;
    if (!tokens?.accessToken) return 0;

    const res = await fetch(`${env.API_URL}/api/v1/contacts/count/new`, {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });

    if (!res.ok) return 0;

    const response = await res.json();
    return response.data?.count || 0;
  } catch (error) {
    console.error("Error fetching new contacts count:", error);
    return 0;
  }
};

