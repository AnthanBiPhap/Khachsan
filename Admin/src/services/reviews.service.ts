import { env } from "../constanst/getEnvs";

export const fetchReviews = async (page = 1, limit = 10) => {
  try {
    const res = await fetch(`${env.API_URL}/api/v1/reviews?page=${page}&limit=${limit}`);
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch reviews");
    }
    const response = await res.json();
    const { data } = response;

    return {
      data: data?.reviews || [],
      pagination: {
        page: data?.pagination?.page ?? page,
        limit: data?.pagination?.limit ?? limit,
        total: data?.pagination?.totalRecord ?? 0,
      },
    };
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return { data: [], pagination: { page, limit, total: 0 } };
  }
};

export const deleteReview = async (id: string) => {
  const res = await fetch(`${env.API_URL}/api/v1/reviews/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete review");
  return true; // 204 No Content expected
};
