import type { User } from "../types/user";
import { env } from "../constanst/getEnvs"; 
import type { ApiResponse, Pagination } from "../types/user";

const BASE_URL = `${env.API_URL}/api/v1`;

/** Lấy danh sách user kèm phân trang */
export async function fetchUsers(
  page = 1,
  limit = 10
): Promise<ApiResponse<{ users: User[]; pagination: Pagination }>> {
  const res = await fetch(`${BASE_URL}/users?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

/** Xoá user theo id */
export async function deleteUser(id: string): Promise<ApiResponse<null>> {
  const res = await fetch(`${BASE_URL}/users/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete user");
  return res.json();
}

/** Cập nhật thông tin user */
export async function updateUser(
  id: string, 
  data: Partial<User>
): Promise<ApiResponse<User>> {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to update user");
  return res.json();
}
