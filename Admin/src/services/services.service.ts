import { env } from "../constanst/getEnvs";

export const fetchServices = async (page = 1, limit = 10) => {
  try {
    const res = await fetch(`${env.API_URL}/api/v1/services?page=${page}&limit=${limit}`);
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch services");
    }
    const response = await res.json();
    const { data } = response;

    // Some APIs may return data array under data.data (as in the sample)
    const list = Array.isArray(data?.data) ? data.data : Array.isArray(data?.services) ? data.services : [];

    return {
      data: list,
      pagination: {
        page: data?.pagination?.page ?? page,
        limit: data?.pagination?.limit ?? limit,
        total: data?.pagination?.totalRecord ?? 0,
      },
    };
  } catch (error) {
    console.error("Error fetching services:", error);
    return {
      data: [],
      pagination: { page, limit, total: 0 },
    };
  }
};

export const deleteService = async (id: string) => {
  const res = await fetch(`${env.API_URL}/api/v1/services/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete service");
  return true; // 204 No Content
};
