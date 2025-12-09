export type SessionStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";

export interface Session {
  id: string;
  invoiceId: string;
  sessionNumber: number;
  scheduledAt: string | null;
  status: SessionStatus;
  selectedPhotos: string[];
  notes: string | null;
  googleEventId: string | null;
  createdAt: string;
  updatedAt: string;
  invoice?: {
    id: string;
    clientId: string;
    maxNumberSessions: number;
    client?: {
      id: string;
      name: string;
      phone: string;
    };
  };
}

export interface CreateSessionRequest {
  invoiceId: string;
  sessionNumber?: number;
  scheduledAt?: string;
  status?: SessionStatus;
  selectedPhotos?: string[];
  notes?: string;
}

export interface UpdateSessionRequest {
  sessionNumber?: number;
  scheduledAt?: string | null;
  status?: SessionStatus;
  selectedPhotos?: string[];
  notes?: string | null;
}

export interface SessionsResponse {
  success: boolean;
  data: {
    sessions: Session[];
    invoice: {
      id: string;
      maxNumberSessions: number;
      totalSessions: number;
      remainingSessions: number;
    };
  };
}

export interface SessionResponse {
  success: boolean;
  data: {
    session: Session;
  };
}
