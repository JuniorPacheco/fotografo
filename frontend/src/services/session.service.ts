import { protectedApi } from "./api";
import type {
  CreateSessionRequest,
  UpdateSessionRequest,
  SessionsResponse,
  SessionResponse,
} from "@/types/session";

export const sessionService = {
  /**
   * Get all sessions for an invoice
   */
  getByInvoice: async (invoiceId: string): Promise<SessionsResponse> => {
    const response = await protectedApi.get<SessionsResponse>(
      `/sessions/invoice/${invoiceId}`
    );
    return response.data;
  },

  /**
   * Get session by ID
   */
  getById: async (id: string): Promise<SessionResponse> => {
    const response = await protectedApi.get<SessionResponse>(`/sessions/${id}`);
    return response.data;
  },

  /**
   * Create a new session
   */
  create: async (data: CreateSessionRequest): Promise<SessionResponse> => {
    const response = await protectedApi.post<SessionResponse>(
      "/sessions",
      data
    );
    return response.data;
  },

  /**
   * Update an existing session
   */
  update: async (
    id: string,
    data: UpdateSessionRequest
  ): Promise<SessionResponse> => {
    const response = await protectedApi.put<SessionResponse>(
      `/sessions/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete a session
   */
  delete: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await protectedApi.delete<{
      success: boolean;
      message: string;
    }>(`/sessions/${id}`);
    return response.data;
  },
};
