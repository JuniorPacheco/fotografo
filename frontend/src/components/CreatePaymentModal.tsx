import { invoiceService } from "@/services/invoice.service";
import { paymentService } from "@/services/payment.service";
import type { Invoice } from "@/types/invoice";
import type { CreatePaymentRequest } from "@/types/payment";
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

interface CreatePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  invoiceId?: string; // Si se proporciona, no se muestra el selector de factura
}

function CreatePaymentModal({
  isOpen,
  onClose,
  onCreated,
  invoiceId,
}: CreatePaymentModalProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreatePaymentRequest>({
    invoiceId: invoiceId || "",
    amount: 0,
    method: "CASH",
    paymentDate: "",
    notes: "",
  });

  useEffect(() => {
    if (isOpen) {
      if (!invoiceId) {
        loadInvoices();
      } else {
        setFormData((prev) => ({ ...prev, invoiceId }));
      }
    }
  }, [isOpen, invoiceId]);

  const loadInvoices = async () => {
    try {
      const response = await invoiceService.getAll({ limit: 1000 });
      setInvoices(response.data.invoices);
    } catch (error) {
      console.error("Error loading invoices:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Convertir paymentDate a formato ISO si existe
      const submitData: CreatePaymentRequest = {
        ...formData,
        paymentDate: formData.paymentDate
          ? new Date(formData.paymentDate).toISOString()
          : undefined,
      };
      await paymentService.create(submitData);
      setFormData({
        invoiceId: "",
        amount: 0,
        method: "CASH",
        paymentDate: "",
        notes: "",
      });
      onCreated();
      onClose();
    } catch (error) {
      console.error("Error creating payment:", error);
      alert("Error al crear el pago");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crear Pago</DialogTitle>
          <DialogDescription>
            Completa el formulario para crear un nuevo pago
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!invoiceId && (
            <div className="space-y-2">
              <Label htmlFor="create-invoiceId">Factura *</Label>
              <Select
                value={formData.invoiceId}
                onValueChange={(value) =>
                  setFormData({ ...formData, invoiceId: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar factura" />
                </SelectTrigger>
                <SelectContent>
                  {invoices.map((invoice) => (
                    <SelectItem key={invoice.id} value={invoice.id}>
                      {invoice.client.name} -{" "}
                      {new Intl.NumberFormat("es-CO", {
                        style: "currency",
                        currency: "COP",
                      }).format(Number(invoice.totalAmount))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="create-amount">Monto *</Label>
            <Input
              type="number"
              id="create-amount"
              step="0.01"
              min="0.01"
              value={formData.amount || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  amount: parseFloat(e.target.value) || 0,
                })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-method">Método de Pago</Label>
            <Select
              value={formData.method}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  method: value as CreatePaymentRequest["method"],
                })
              }
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
            <Label htmlFor="create-paymentDate">Fecha de Pago</Label>
            <Input
              type="datetime-local"
              id="create-paymentDate"
              value={formData.paymentDate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  paymentDate: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-notes">Notas</Label>
            <Textarea
              id="create-notes"
              value={formData.notes || ""}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creando..." : "Crear Pago"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreatePaymentModal;
