export interface Invoice {
  id: string;
  clientId: string;
  packageId: string | null;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  maxNumberSessions: number;
  photosFolderPath: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    name: string;
    phone: string;
    address?: string;
  };
  package?: {
    id: string;
    name: string;
    suggestedPrice: number;
  } | null;
  _count: {
    sessions: number;
    payments: number;
  };
}

export interface CreateInvoiceRequest {
  clientId: string;
  packageId?: string | null;
  totalAmount: number;
  maxNumberSessions?: number;
  photosFolderPath?: string;
  notes?: string;
  status?: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
}

export interface UpdateInvoiceRequest {
  clientId?: string;
  packageId?: string | null;
  totalAmount?: number;
  maxNumberSessions?: number;
  photosFolderPath?: string | null;
  notes?: string | null;
  status?: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
}

export interface InvoicesResponse {
  success: boolean;
  data: {
    invoices: Invoice[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}

export interface InvoiceResponse {
  success: boolean;
  data: {
    invoice: Invoice;
  };
}
