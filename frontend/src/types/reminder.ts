export interface Reminder {
  id: string;
  date: string;
  clientName: string;
  description: string;
  sentAt: string | null;
  isSent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RemindersResponse {
  success: boolean;
  data: {
    reminders: Reminder[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}
