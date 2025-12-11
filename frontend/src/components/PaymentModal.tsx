import { paymentService } from "@/services/payment.service";
import type { Payment, UpdatePaymentRequest } from "@/types/payment";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { convertToColombiaISO, convertFromISOToLocal } from "@/lib/date.utils";

interface PaymentModalProps {
  paymentId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

function PaymentModal({
  paymentId,
  isOpen,
  onClose,
  onUpdate,
}: PaymentModalProps) {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [remainingAmount, setRemainingAmount] = useState<number | null>(null);
  const [amountError, setAmountError] = useState<string>("");
  const [formData, setFormData] = useState<UpdatePaymentRequest>({
    amount: 0,
    method: "CASH",
    paymentDate: null,
    notes: null,
  });

  useEffect(() => {
    if (isOpen && paymentId) {
      loadPayment();
    }
  }, [isOpen, paymentId]);

  const loadPayment = async () => {
    if (!paymentId) return;
    setIsLoading(true);
    try {
      const response = await paymentService.getById(paymentId);
      const paymentData = response.data.payment;
      setPayment(paymentData);
      setFormData({
        amount: Number(paymentData.amount),
        method: paymentData.method,
        paymentDate: paymentData.paymentDate
          ? convertFromISOToLocal(paymentData.paymentDate)
          : null,
        notes: paymentData.notes,
      });

      // Cargar saldo restante de la factura
      if (paymentData.invoice?.id) {
        const invoiceResponse = await paymentService.getByInvoice(
          paymentData.invoice.id
        );
        // El saldo restante incluye el monto actual del pago, así que necesitamos sumarlo
        const currentPaymentAmount = Number(paymentData.amount);
        const remainingWithCurrent =
          invoiceResponse.data.invoice.remainingAmount + currentPaymentAmount;
        setRemainingAmount(remainingWithCurrent);
      }
    } catch (error) {
      console.error("Error loading payment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentId) return;

    // Validar monto antes de enviar
    if (
      remainingAmount !== null &&
      formData.amount !== undefined &&
      formData.amount > remainingAmount
    ) {
      setAmountError(
        `El monto no puede exceder el saldo restante de ${new Intl.NumberFormat(
          "es-CO",
          {
            style: "currency",
            currency: "COP",
          }
        ).format(remainingAmount)}`
      );
      return;
    }

    setIsSaving(true);
    setAmountError("");
    try {
      // Convertir paymentDate a formato ISO si existe, considerando zona horaria de Colombia
      const submitData: UpdatePaymentRequest = {
        ...formData,
        paymentDate: formData.paymentDate
          ? convertToColombiaISO(formData.paymentDate)
          : null,
      };
      await paymentService.update(paymentId, submitData);
      setAmountError("");
      onUpdate();
      onClose();
    } catch (error: unknown) {
      console.error("Error updating payment:", error);
      if (
        error instanceof Error &&
        error.message.includes("no puede exceder")
      ) {
        setAmountError(error.message);
      } else {
        alert("Error al actualizar el pago");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalles de Pago</DialogTitle>
          <DialogDescription>Edita los detalles del pago</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="text-center py-4">Cargando...</p>
        ) : payment ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                <strong>Cliente:</strong> {payment.invoice.client.name}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Teléfono:</strong> {payment.invoice.client.phone}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Monto</Label>
              <Input
                type="number"
                id="amount"
                step="0.01"
                min="0.01"
                max={remainingAmount !== null ? remainingAmount : undefined}
                value={formData.amount}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  setFormData({
                    ...formData,
                    amount: value,
                  });
                  // Validar en tiempo real
                  if (remainingAmount !== null && value > remainingAmount) {
                    setAmountError(
                      `El monto no puede exceder el saldo restante de ${new Intl.NumberFormat(
                        "es-CO",
                        {
                          style: "currency",
                          currency: "COP",
                        }
                      ).format(remainingAmount)}`
                    );
                  } else {
                    setAmountError("");
                  }
                }}
                required
                className={amountError ? "border-destructive" : ""}
              />
              {remainingAmount !== null && (
                <p className="text-xs text-muted-foreground">
                  Saldo restante disponible:{" "}
                  <span
                    className={
                      remainingAmount > 0
                        ? "text-destructive"
                        : "text-green-600"
                    }
                  >
                    {new Intl.NumberFormat("es-CO", {
                      style: "currency",
                      currency: "COP",
                    }).format(remainingAmount)}
                  </span>
                </p>
              )}
              {amountError && (
                <p className="text-xs text-destructive">{amountError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="method">Método de Pago</Label>
              <Select
                value={formData.method}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    method: value as Payment["method"],
                  })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Efectivo</SelectItem>
                  <SelectItem value="TRANSFER">Transferencia</SelectItem>
                  <SelectItem value="CARD">Tarjeta</SelectItem>
                  <SelectItem value="OTHER">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentDate">Fecha de Pago</Label>
              <Input
                type="datetime-local"
                id="paymentDate"
                value={formData.paymentDate || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentDate: e.target.value || null,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={formData.notes || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    notes: e.target.value || null,
                  })
                }
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        ) : (
          <p className="text-center py-4 text-destructive">
            Error al cargar el pago
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default PaymentModal;
