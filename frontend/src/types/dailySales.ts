export interface DailySalesPayment {
  id: string;
  amount: number;
  method: "CASH" | "TRANSFER" | "CARD" | "OTHER";
  paymentDate: string;
  notes: string | null;
  clientName: string;
  clientPhone: string;
  packageName: string | null;
}

export interface DailySales {
  date: string;
  totalAmount: number;
  totalPayments: number;
  totalsByMethod: {
    CASH?: number;
    TRANSFER?: number;
    CARD?: number;
    OTHER?: number;
  };
  payments: DailySalesPayment[];
}

export interface DailySalesResponse {
  success: boolean;
  data: DailySales;
}
