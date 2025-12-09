import { protectedApi } from "./api";
import type { RemindersResponse } from "@/types/reminder";

export const reminderService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    clientName?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<RemindersResponse> => {
    const response = await protectedApi.get<RemindersResponse>("/reminders", {
      params,
    });
    return response.data;
  },
};
