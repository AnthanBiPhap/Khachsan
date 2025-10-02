import { env } from "../constanst/getEnvs";

export const fetchLocations = async (page = 1, limit = 10) => {
  try {
    const res = await fetch(`${env.API_URL}/api/v1/locations?page=${page}&limit=${limit}`);
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch locations");
    }
    const response = await res.json();
    const { data } = response;

    return {
      data: data?.locations || [],
      pagination: {
        page: data?.pagination?.page ?? page,
        limit: data?.pagination?.limit ?? limit,
        total: data?.pagination?.totalRecord ?? 0,
      },
    };
  } catch (error) {
    console.error("Error fetching locations:", error);
    return { data: [], pagination: { page, limit, total: 0 } };
  }
};

export const deleteLocation = async (id: string) => {
  const res = await fetch(`${env.API_URL}/api/v1/locations/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete location");
  return true;
};
