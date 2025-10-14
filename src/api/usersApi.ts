import { apiRequest } from "./clients/apiClient";

export type User = {
  id: string;
  createdAt: string;
  updatedAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: "ADMIN" | "APPLICANT" | "GUEST";
};

export type UsersResponse = {
  data: User[];
  meta: {
    itemCount: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
};

export type UsersQueryParams = {
  page?: number;
  take?: number;
  q?: string;
  role?: string;
  sort?: string;
  order?: string;
};

const BASE = "/api/v1/users";

export async function getUsers(params: UsersQueryParams = {}): Promise<UsersResponse> {
  const searchParams = new URLSearchParams();
  
  if (params.page !== undefined) searchParams.append('page', params.page.toString());
  if (params.take !== undefined) searchParams.append('take', params.take.toString());
  if (params.q) searchParams.append('q', params.q);
  if (params.role) searchParams.append('role', params.role);
  if (params.sort) searchParams.append('sort', params.sort);
  if (params.order) searchParams.append('order', params.order);

  const queryString = searchParams.toString();
  const url = queryString ? `${BASE}?${queryString}` : BASE;
  
  return apiRequest<UsersResponse>(url, "GET");
}

export async function getUser(id: string): Promise<User> {
  return apiRequest<User>(`${BASE}/${id}`, "GET");
}

export async function updateUser(id: string, data: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User> {
  return apiRequest<User>(`${BASE}/${id}`, "PATCH", data);
}

export async function deleteUser(id: string): Promise<void> {
  return apiRequest<void>(`${BASE}/${id}`, "DELETE");
}
