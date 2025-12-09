import { protectedApi } from "./api";
import type {
  CreateClientRequest,
  UpdateClientRequest,
  ClientsResponse,
  ClientResponse,
} from "@/types/client";

export const clientService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    name?: string;
    orderBy?: "asc" | "desc";
  }): Promise<ClientsResponse> => {
    const response = await protectedApi.get<ClientsResponse>("/clients", {
      params,
    });
    return response.data;
  },

  getById: async (id: string): Promise<ClientResponse> => {
    const response = await protectedApi.get<ClientResponse>(`/clients/${id}`);
    return response.data;
  },

  create: async (data: CreateClientRequest): Promise<ClientResponse> => {
    const response = await protectedApi.post<ClientResponse>("/clients", data);
    return response.data;
  },

  update: async (
    id: string,
    data: UpdateClientRequest
  ): Promise<ClientResponse> => {
    const response = await protectedApi.put<ClientResponse>(
      `/clients/${id}`,
      data
    );
    return response.data;
  },

  delete: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await protectedApi.delete<{
      success: boolean;
      message: string;
    }>(`/clients/${id}`);
    return response.data;
  },
};
