import { useState, useEffect } from "react";
import type { Payment } from "@/types/payment";
import { paymentService } from "@/services/payment.service";
import { invoiceService } from "@/services/invoice.service";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { formatDate } from "@/lib/date.utils";

interface PaymentTicketModalProps {
  paymentId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

function PaymentTicketModal({
  paymentId,
  isOpen,
  onClose,
}: PaymentTicketModalProps) {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [invoice, setInvoice] = useState<{
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    client: {
      name: string;
      phone: string;
      address: string;
    };
    package?: {
      name: string;
    } | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && paymentId) {
      loadPaymentData();
    }
  }, [isOpen, paymentId]);

  const loadPaymentData = async () => {
    if (!paymentId) return;
    setIsLoading(true);
    try {
      const paymentResponse = await paymentService.getById(paymentId);
      const paymentData = paymentResponse.data.payment;
      setPayment(paymentData);

      // Cargar información completa de la factura para obtener total pagado
      const invoiceResponse = await invoiceService.getById(
        paymentData.invoiceId
      );
      const invoiceData = invoiceResponse.data.invoice;
      setInvoice({
        totalAmount: invoiceData.totalAmount,
        paidAmount: invoiceData.paidAmount,
        remainingAmount: invoiceData.remainingAmount,
        client: {
          name: invoiceData.client.name,
          phone: invoiceData.client.phone,
          address: invoiceData.client.address || "",
        },
        package: invoiceData.package || null,
      });
    } catch (error) {
      console.error("Error loading payment data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
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

  if (!payment || !invoice) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          {isLoading ? (
            <p className="text-center py-4">Cargando...</p>
          ) : (
            <p className="text-center py-4 text-destructive">
              Error al cargar los datos del pago
            </p>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  // Obtener el total pagado desde la factura (ya calculado en el backend)
  // Para el ticket, mostramos el monto de este pago específico y el total de la factura

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md print:max-w-none print:p-0 print:border-0 print:shadow-none">
          <div className="print:hidden mb-4">
            <Button onClick={handlePrint} className="w-full">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir Ticket
            </Button>
          </div>

          {/* Ticket térmico */}
          <div className="ticket-container print:block">
            <div className="ticket-content">
              <div className="ticket-header">
                <h1 className="ticket-title">CABAL STUDIOS</h1>
                <p className="ticket-subtitle">FACTURA DE PAGO</p>
                <div className="ticket-divider"></div>
              </div>

              <div className="ticket-section">
                <p className="ticket-label">Cliente:</p>
                <p className="ticket-value">{invoice.client.name}</p>
              </div>

              {invoice.client.address && (
                <div className="ticket-section">
                  <p className="ticket-label">Dirección:</p>
                  <p className="ticket-value">{invoice.client.address}</p>
                </div>
              )}

              <div className="ticket-section">
                <p className="ticket-label">Teléfono:</p>
                <p className="ticket-value">{invoice.client.phone}</p>
              </div>

              {invoice.package && (
                <>
                  <div className="ticket-divider"></div>
                  <div className="ticket-section">
                    <p className="ticket-label">Paquete:</p>
                    <p className="ticket-value">{invoice.package.name}</p>
                  </div>
                </>
              )}

              <div className="ticket-divider"></div>

              <div className="ticket-section">
                <p className="ticket-label">Monto del Pago:</p>
                <p className="ticket-value-large">
                  {formatCurrency(Number(payment.amount))}
                </p>
              </div>

              <div className="ticket-section">
                <p className="ticket-label">Método de Pago:</p>
                <p className="ticket-value">{getMethodLabel(payment.method)}</p>
              </div>

              <div className="ticket-section">
                <p className="ticket-label">Fecha de Pago:</p>
                <p className="ticket-value">
                  {formatDate(payment.paymentDate)}
                </p>
              </div>

              <div className="ticket-divider"></div>

              <div className="ticket-section">
                <p className="ticket-label">Total Factura:</p>
                <p className="ticket-value">
                  {formatCurrency(invoice.totalAmount)}
                </p>
              </div>

              <div className="ticket-section">
                <p className="ticket-label">Total Pagado:</p>
                <p className="ticket-value">
                  {formatCurrency(invoice.paidAmount)}
                </p>
              </div>

              <div className="ticket-section">
                <p className="ticket-label">Saldo Pendiente:</p>
                <p
                  className={`ticket-value ${
                    invoice.remainingAmount > 0
                      ? "ticket-warning"
                      : "ticket-success"
                  }`}
                >
                  {formatCurrency(invoice.remainingAmount)}
                </p>
              </div>

              {payment.notes && (
                <>
                  <div className="ticket-divider"></div>
                  <div className="ticket-section">
                    <p className="ticket-label">Notas:</p>
                    <p className="ticket-value">{payment.notes}</p>
                  </div>
                </>
              )}

              <div className="ticket-divider"></div>

              <div className="ticket-footer">
                <p className="ticket-thank-you">¡Gracias por su pago!</p>
                <p className="ticket-footer-text">
                  {new Date().toLocaleDateString("es-CO", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          <style>{`
            @media print {
              @page {
                size: 80mm auto;
                margin: 0;
              }
              body * {
                visibility: hidden;
              }
              .ticket-container,
              .ticket-container * {
                visibility: visible;
              }
              .ticket-container {
                position: absolute;
                left: 0;
                top: 0;
                width: 80mm;
                max-width: 80mm;
                padding: 5mm 4mm;
                margin: 0;
                box-shadow: none;
                border: none;
                background: white;
              }
              .print\\:hidden {
                display: none !important;
              }
              .print\\:block {
                display: block !important;
              }
            }

            .ticket-container {
              width: 100%;
              max-width: 80mm;
              margin: 0 auto;
              background: white;
              padding: 20px;
            }

            .ticket-content {
              font-family: 'Courier New', monospace;
              font-size: 9px;
              line-height: 1.15;
              color: #000;
              width: 100%;
            }

            .ticket-header {
              text-align: center;
              margin-bottom: 8px;
            }

            .ticket-title {
              font-size: 13px;
              font-weight: bold;
              margin: 0 0 2px 0;
              letter-spacing: 0.5px;
              text-transform: uppercase;
            }

            .ticket-subtitle {
              font-size: 8px;
              margin: 0 0 5px 0;
              text-transform: uppercase;
            }

            .ticket-divider {
              border-top: 1px dashed #000;
              margin: 5px 0;
            }

            .ticket-section {
              margin: 3px 0;
            }

            .ticket-label {
              font-weight: bold;
              margin: 0 0 1px 0;
              font-size: 8px;
            }

            .ticket-value {
              margin: 0 0 2px 0;
              font-size: 8px;
              word-wrap: break-word;
            }

            .ticket-value-large {
              margin: 0 0 2px 0;
              font-size: 11px;
              font-weight: bold;
            }

            .ticket-warning {
              color: #000;
              font-weight: bold;
            }

            .ticket-success {
              color: #000;
              font-weight: bold;
            }

            .ticket-footer {
              text-align: center;
              margin-top: 8px;
            }

            .ticket-thank-you {
              font-size: 9px;
              font-weight: bold;
              margin: 6px 0 2px 0;
            }

            .ticket-footer-text {
              font-size: 7px;
              margin: 2px 0 0 0;
            }
          `}</style>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default PaymentTicketModal;
