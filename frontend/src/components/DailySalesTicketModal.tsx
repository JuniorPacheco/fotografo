import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import type { DailySales } from "@/types/dailySales";

interface DailySalesTicketModalProps {
  dailySales: DailySales;
  isOpen: boolean;
  onClose: () => void;
}

function DailySalesTicketModal({
  dailySales,
  isOpen,
  onClose,
}: DailySalesTicketModalProps) {
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

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getMethodLabel = (method: string): string => {
    const labels: Record<string, string> = {
      CASH: "Efectivo",
      TRANSFER: "Transferencia",
      CARD: "Tarjeta",
      OTHER: "Otro",
    };
    return labels[method] || method;
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl print:max-w-none">
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
              <p className="ticket-subtitle">REPORTE DE VENTAS</p>
              <div className="ticket-divider"></div>
            </div>

            <div className="ticket-section">
              <p className="ticket-label">Fecha:</p>
              <p className="ticket-value">{formatDate(dailySales.date)}</p>
            </div>

            <div className="ticket-divider"></div>

            <div className="ticket-section">
              <p className="ticket-label">Total de Pagos:</p>
              <p className="ticket-value">{dailySales.totalPayments}</p>
            </div>

            <div className="ticket-section">
              <p className="ticket-label">Total Vendido:</p>
              <p className="ticket-value-large">
                {formatCurrency(dailySales.totalAmount)}
              </p>
            </div>

            <div className="ticket-divider"></div>

            {Object.keys(dailySales.totalsByMethod).length > 0 && (
              <>
                <div className="ticket-section">
                  <p className="ticket-label">Desglose por Método:</p>
                </div>
                {Object.entries(dailySales.totalsByMethod).map(
                  ([method, amount]) => (
                    <div key={method} className="ticket-section">
                      <p className="ticket-value">
                        {getMethodLabel(method)}: {formatCurrency(amount)}
                      </p>
                    </div>
                  )
                )}
                <div className="ticket-divider"></div>
              </>
            )}

            {dailySales.payments.length > 0 && (
              <>
                <div className="ticket-section">
                  <p className="ticket-label">Detalle de Pagos:</p>
                </div>
                {dailySales.payments.map((payment, index) => (
                  <div key={payment.id}>
                    <div className="ticket-section">
                      <p
                        className="ticket-value"
                        style={{ fontWeight: "bold" }}
                      >
                        {index + 1}. {payment.clientName}
                      </p>
                      <p className="ticket-value">
                        {formatTime(payment.paymentDate)} -{" "}
                        {formatCurrency(payment.amount)} (
                        {getMethodLabel(payment.method)})
                      </p>
                      {payment.packageName && (
                        <p className="ticket-value" style={{ fontSize: "8px" }}>
                          Paquete: {payment.packageName}
                        </p>
                      )}
                    </div>
                    {index < dailySales.payments.length - 1 && (
                      <div
                        className="ticket-divider"
                        style={{ margin: "3px 0" }}
                      ></div>
                    )}
                  </div>
                ))}
                <div className="ticket-divider"></div>
              </>
            )}

            <div className="ticket-footer">
              <p className="ticket-thank-you">Total del Día</p>
              <p className="ticket-value-large">
                {formatCurrency(dailySales.totalAmount)}
              </p>
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
  );
}

export default DailySalesTicketModal;
