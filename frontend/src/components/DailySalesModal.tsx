import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { paymentService } from "@/services/payment.service";
import type { DailySales } from "@/types/dailySales";
import DailySalesTicketModal from "./DailySalesTicketModal";
import { Printer } from "lucide-react";
import { formatDateOnly, formatTime } from "@/lib/date.utils";

interface DailySalesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function DailySalesModal({ isOpen, onClose }: DailySalesModalProps) {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [dailySales, setDailySales] = useState<DailySales | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos automáticamente cuando cambia la fecha
  useEffect(() => {
    if (isOpen && selectedDate) {
      loadDailySales();
    }
  }, [selectedDate, isOpen]);

  const loadDailySales = async () => {
    if (!selectedDate) {
      setDailySales(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await paymentService.getDailySales(selectedDate);
      setDailySales(response.data);
    } catch (err) {
      console.error("Error loading daily sales:", err);
      setError("Error al cargar las ventas del día");
      setDailySales(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    if (dailySales) {
      setIsTicketModalOpen(true);
    }
  };

  const handleClose = () => {
    setError(null);
    setDailySales(null);
    onClose();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Imprimir Ventas</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">Seleccionar Fecha</Label>
              <Input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            {isLoading && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Cargando ventas...
              </p>
            )}

            {dailySales && !isLoading && (
              <div className="space-y-4">
                <div className="rounded-md border p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Resumen del Día</h3>
                    <span className="text-sm text-muted-foreground">
                      {formatDateOnly(dailySales.date)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        Total de Pagos:
                      </span>{" "}
                      <span className="font-medium">
                        {dailySales.totalPayments}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Total Vendido:
                      </span>{" "}
                      <span className="font-medium">
                        {formatCurrency(dailySales.totalAmount)}
                      </span>
                    </div>
                  </div>
                  {Object.keys(dailySales.totalsByMethod).length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium mb-2">
                        Desglose por Método:
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(dailySales.totalsByMethod).map(
                          ([method, amount]) => (
                            <div key={method}>
                              <span className="text-muted-foreground">
                                {getMethodLabel(method)}:
                              </span>{" "}
                              <span className="font-medium">
                                {formatCurrency(amount)}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {dailySales.payments.length > 0 ? (
                  <div className="rounded-md border">
                    <div className="p-4 border-b">
                      <h3 className="font-semibold">Detalle de Pagos</h3>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Hora</TableHead>
                          <TableHead>Monto</TableHead>
                          <TableHead>Método</TableHead>
                          <TableHead>Paquete</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dailySales.payments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell className="font-medium">
                              {payment.clientName}
                            </TableCell>
                            <TableCell>
                              {formatTime(payment.paymentDate)}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(payment.amount)}
                            </TableCell>
                            <TableCell>
                              {getMethodLabel(payment.method)}
                            </TableCell>
                            <TableCell>{payment.packageName || "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay pagos registrados para esta fecha
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                onClick={handlePrint}
                disabled={
                  isLoading || !dailySales || dailySales.payments.length === 0
                }
              >
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {dailySales && (
        <DailySalesTicketModal
          dailySales={dailySales}
          isOpen={isTicketModalOpen}
          onClose={() => {
            setIsTicketModalOpen(false);
          }}
        />
      )}
    </>
  );
}

export default DailySalesModal;
