import { env } from "../constanst/getEnvs";

export const fetchRooms = async (page = 1, limit = 10) => {
  try {
    const res = await fetch(`${env.API_URL}/api/v1/rooms?page=${page}&limit=${limit}`);
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch rooms");
    }
    const response = await res.json();
    const { data } = response;

    return {
      data: data?.rooms || [],
      pagination: {
        page: data?.pagination?.page ?? page,
        limit: data?.pagination?.limit ?? limit,
        total: data?.pagination?.totalRecord ?? 0,
      },
    };
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return {
      data: [],
      pagination: {
        page,
        limit,
        total: 0,
      },
    };
  }
};

export const deleteRoom = async (id: string) => {
  const res = await fetch(`${env.API_URL}/api/v1/rooms/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete room");
  return true; // assume 204 No Content
};

export const getAvailableRooms = async (checkIn: string, checkOut: string, extendHours: number = 0) => {
  try {
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      extendHours: extendHours.toString(),
    });
    const res = await fetch(`${env.API_URL}/api/v1/rooms/available?${params}`);
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch available rooms");
    }
    const response = await res.json();
    return response.data?.rooms || [];
  } catch (error) {
    console.error("Error fetching available rooms:", error);
    throw error;
  }
};
