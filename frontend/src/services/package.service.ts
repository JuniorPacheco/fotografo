import { protectedApi } from "./api";
import type {
  CreatePackageRequest,
  UpdatePackageRequest,
  PackagesResponse,
  PackageResponse,
} from "@/types/package";

export const packageService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    name?: string;
    orderBy?: "asc" | "desc";
  }): Promise<PackagesResponse> => {
    const response = await protectedApi.get<PackagesResponse>("/packages", {
      params,
    });
    return response.data;
  },

  getById: async (id: string): Promise<PackageResponse> => {
    const response = await protectedApi.get<PackageResponse>(`/packages/${id}`);
    return response.data;
  },

  create: async (data: CreatePackageRequest): Promise<PackageResponse> => {
    const response = await protectedApi.post<PackageResponse>(
      "/packages",
      data
    );
    return response.data;
  },

  update: async (
    id: string,
    data: UpdatePackageRequest
  ): Promise<PackageResponse> => {
    const response = await protectedApi.put<PackageResponse>(
      `/packages/${id}`,
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
    }>(`/packages/${id}`);
    return response.data;
  },
};
