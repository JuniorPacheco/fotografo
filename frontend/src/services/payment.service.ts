import { protectedApi } from "./api";
import type {
  CreatePaymentRequest,
  UpdatePaymentRequest,
  PaymentsResponse,
  PaymentResponse,
  Payment,
} from "@/types/payment";
import type { DailySalesResponse } from "@/types/dailySales";

export const paymentService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    clientName?: string;
    orderBy?: "asc" | "desc";
  }): Promise<PaymentsResponse> => {
    const response = await protectedApi.get<PaymentsResponse>("/payments", {
      params,
    });
    return response.data;
  },

  getById: async (id: string): Promise<PaymentResponse> => {
    const response = await protectedApi.get<PaymentResponse>(`/payments/${id}`);
    return response.data;
  },

  getByInvoice: async (
    invoiceId: string
  ): Promise<{
    success: boolean;
    data: {
      payments: Payment[];
      invoice: {
        id: string;
        totalAmount: number;
        totalPaid: number;
        remainingAmount: number;
      };
    };
  }> => {
    const response = await protectedApi.get<{
      success: boolean;
      data: {
        payments: Payment[];
        invoice: {
          id: string;
          totalAmount: number;
          totalPaid: number;
          remainingAmount: number;
        };
      };
    }>(`/payments/invoice/${invoiceId}`);
    return response.data;
  },

  create: async (data: CreatePaymentRequest): Promise<PaymentResponse> => {
    const response = await protectedApi.post<PaymentResponse>(
      "/payments",
      data
    );
    return response.data;
  },

  update: async (
    id: string,
    data: UpdatePaymentRequest
  ): Promise<PaymentResponse> => {
    const response = await protectedApi.put<PaymentResponse>(
      `/payments/${id}`,
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
    }>(`/payments/${id}`);
    return response.data;
  },

  getDailySales: async (date: string): Promise<DailySalesResponse> => {
    const response = await protectedApi.get<DailySalesResponse>(
      "/payments/daily-sales",
      {
        params: { date },
      }
    );
    return response.data;
  },
};
