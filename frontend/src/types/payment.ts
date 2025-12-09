export type PaymentMethod = "CASH" | "TRANSFER" | "CARD" | "OTHER";

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  paymentDate: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  invoice: {
    id: string;
    client: {
      id: string;
      name: string;
      phone: string;
    };
  };
}

export interface CreatePaymentRequest {
  invoiceId: string;
  amount: number;
  method?: PaymentMethod;
  paymentDate?: string;
  notes?: string;
}

export interface UpdatePaymentRequest {
  amount?: number;
  method?: PaymentMethod;
  paymentDate?: string | null;
  notes?: string | null;
}

export interface PaymentsResponse {
  success: boolean;
  data: {
    payments: Payment[];
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

export interface PaymentResponse {
  success: boolean;
  data: {
    payment: Payment;
  };
}
