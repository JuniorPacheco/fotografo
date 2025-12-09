import { protectedApi } from "./api";
import type {
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  InvoicesResponse,
  InvoiceResponse,
} from "@/types/invoice";

export const invoiceService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    clientName?: string;
    orderBy?: "asc" | "desc";
  }): Promise<InvoicesResponse> => {
    const response = await protectedApi.get<InvoicesResponse>("/invoices", {
      params,
    });
    return response.data;
  },

  getById: async (id: string): Promise<InvoiceResponse> => {
    const response = await protectedApi.get<InvoiceResponse>(`/invoices/${id}`);
    return response.data;
  },

  create: async (data: CreateInvoiceRequest): Promise<InvoiceResponse> => {
    const response = await protectedApi.post<InvoiceResponse>(
      "/invoices",
      data
    );
    return response.data;
  },

  update: async (
    id: string,
    data: UpdateInvoiceRequest
  ): Promise<InvoiceResponse> => {
    const response = await protectedApi.put<InvoiceResponse>(
      `/invoices/${id}`,
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
    }>(`/invoices/${id}`);
    return response.data;
  },
};
