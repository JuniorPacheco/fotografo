import { useState, useEffect } from "react";
import type { Payment } from "@/types/payment";
import { paymentService } from "@/services/payment.service";
import PaymentModal from "./PaymentModal";
import CreatePaymentModal from "./CreatePaymentModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Trash2, Plus, Printer } from "lucide-react";
import PaymentTicketModal from "./PaymentTicketModal";

interface InvoicePaymentsModalProps {
  invoiceId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

function InvoicePaymentsModal({
  invoiceId,
  isOpen,
  onClose,
  onUpdate,
}: InvoicePaymentsModalProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoiceInfo, setInvoiceInfo] = useState<{
    id: string;
    totalAmount: number;
    totalPaid: number;
    remainingAmount: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(
    null
  );
  const [selectedPaymentIdForTicket, setSelectedPaymentIdForTicket] = useState<
    string | null
  >(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen && invoiceId) {
      loadPayments();
    }
  }, [isOpen, invoiceId]);

  const loadPayments = async () => {
    if (!invoiceId) return;
    setIsLoading(true);
    try {
      const response = await paymentService.getByInvoice(invoiceId);
      setPayments(response.data.payments);
      setInvoiceInfo(response.data.invoice);
    } catch (error) {
      console.error("Error loading payments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (paymentId: string) => {
    setSelectedPaymentId(paymentId);
    setIsPaymentModalOpen(true);
  };

  const handlePrintTicket = (paymentId: string) => {
    setSelectedPaymentIdForTicket(paymentId);
    setIsTicketModalOpen(true);
  };

  const handleTicketModalClose = () => {
    setIsTicketModalOpen(false);
    setSelectedPaymentIdForTicket(null);
  };

  const handleDelete = async (paymentId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este pago?")) {
      return;
    }

    try {
      await paymentService.delete(paymentId);
      loadPayments();
      onUpdate();
    } catch (error) {
      console.error("Error deleting payment:", error);
      alert("Error al eliminar el pago");
    }
  };

  const handlePaymentModalClose = () => {
    setIsPaymentModalOpen(false);
    setSelectedPaymentId(null);
  };

  const handlePaymentUpdate = () => {
    loadPayments();
    onUpdate();
  };

  const handleCreated = () => {
    loadPayments();
    onUpdate();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMethodLabel = (method: Payment["method"]): string => {
    const labels: Record<Payment["method"], string> = {
      CASH: "Efectivo",
      TRANSFER: "Transferencia",
      CARD: "Tarjeta",
      OTHER: "Otro",
    };
    return labels[method];
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pagos de la Factura</DialogTitle>
            <DialogDescription>
              Gestiona los pagos asociados a esta factura
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <p className="text-center py-4">Cargando pagos...</p>
          ) : invoiceInfo ? (
            <>
              {/* Resumen de la factura */}
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Monto Total
                      </p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(invoiceInfo.totalAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Pagado
                      </p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(invoiceInfo.totalPaid)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Pendiente
                      </p>
                      <p
                        className={`text-lg font-semibold ${
                          invoiceInfo.remainingAmount > 0
                            ? "text-destructive"
                            : "text-green-600"
                        }`}
                      >
                        {formatCurrency(invoiceInfo.remainingAmount)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Botón para crear pago */}
              <div className="flex justify-end">
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Pago
                </Button>
              </div>

              {/* Tabla de pagos */}
              {payments.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No hay pagos registrados para esta factura
                </p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Monto</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead>Fecha de Pago</TableHead>
                        <TableHead>Notas</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">
                            {formatCurrency(Number(payment.amount))}
                          </TableCell>
                          <TableCell>
                            {getMethodLabel(payment.method)}
                          </TableCell>
                          <TableCell>
                            {formatDate(payment.paymentDate)}
                          </TableCell>
                          <TableCell>{payment.notes || "-"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handlePrintTicket(payment.id)}
                                aria-label="Imprimir ticket"
                                title="Imprimir ticket"
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleView(payment.id)}
                                aria-label="Editar pago"
                                title="Editar"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(payment.id)}
                                aria-label="Eliminar pago"
                                title="Eliminar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          ) : (
            <p className="text-center py-4 text-destructive">
              Error al cargar los pagos
            </p>
          )}
        </DialogContent>
      </Dialog>

      {/* Modales anidados */}
      <PaymentModal
        paymentId={selectedPaymentId}
        isOpen={isPaymentModalOpen}
        onClose={handlePaymentModalClose}
        onUpdate={handlePaymentUpdate}
      />

      <CreatePaymentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleCreated}
        invoiceId={invoiceId || undefined}
      />

      <PaymentTicketModal
        paymentId={selectedPaymentIdForTicket}
        isOpen={isTicketModalOpen}
        onClose={handleTicketModalClose}
      />
    </>
  );
}

export default InvoicePaymentsModal;
