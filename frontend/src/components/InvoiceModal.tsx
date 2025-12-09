import { useState, useEffect } from "react";
import type { Invoice, UpdateInvoiceRequest } from "@/types/invoice";
import type { Client } from "@/types/client";
import { invoiceService } from "@/services/invoice.service";
import { clientService } from "@/services/client.service";
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

interface InvoiceModalProps {
  invoiceId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

function InvoiceModal({
  invoiceId,
  isOpen,
  onClose,
  onUpdate,
}: InvoiceModalProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<UpdateInvoiceRequest>({
    clientId: "",
    totalAmount: 0,
    maxNumberSessions: 1,
    photosFolderPath: null,
    notes: null,
    status: "PENDING",
  });

  useEffect(() => {
    if (isOpen && invoiceId) {
      loadInvoice();
      loadClients();
    }
  }, [isOpen, invoiceId]);

  const loadInvoice = async () => {
    if (!invoiceId) return;
    setIsLoading(true);
    try {
      const response = await invoiceService.getById(invoiceId);
      const invoiceData = response.data.invoice;
      setInvoice(invoiceData);
      setFormData({
        clientId: invoiceData.clientId,
        totalAmount: Number(invoiceData.totalAmount),
        maxNumberSessions: invoiceData.maxNumberSessions,
        photosFolderPath: invoiceData.photosFolderPath,
        notes: invoiceData.notes,
        status: invoiceData.status,
      });
    } catch (error) {
      console.error("Error loading invoice:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const response = await clientService.getAll({ limit: 1000 });
      setClients(response.data.clients);
    } catch (error) {
      console.error("Error loading clients:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceId) return;

    setIsSaving(true);
    try {
      await invoiceService.update(invoiceId, formData);
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating invoice:", error);
      alert("Error al actualizar la factura");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles de Factura</DialogTitle>
          <DialogDescription>
            Edita los detalles de la factura
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="text-center py-4">Cargando...</p>
        ) : invoice ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientId">Cliente</Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) =>
                  setFormData({ ...formData, clientId: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} - {client.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalAmount">Monto Total</Label>
              <Input
                type="number"
                id="totalAmount"
                step="0.01"
                min="0.01"
                value={formData.totalAmount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalAmount: parseFloat(e.target.value) || 0,
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxNumberSessions">Máximo de Sesiones</Label>
              <Input
                type="number"
                id="maxNumberSessions"
                min="1"
                max="100"
                value={formData.maxNumberSessions}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxNumberSessions: parseInt(e.target.value) || 1,
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photosFolderPath">Ruta de Carpeta de Fotos</Label>
              <Input
                type="text"
                id="photosFolderPath"
                value={formData.photosFolderPath || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    photosFolderPath: e.target.value || null,
                  })
                }
                placeholder="C:\Fotos\Cliente123"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    status: value as Invoice["status"],
                  })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pendiente</SelectItem>
                  <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                  <SelectItem value="COMPLETED">Completado</SelectItem>
                  <SelectItem value="CANCELLED">Cancelado</SelectItem>
                </SelectContent>
              </Select>
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
            Error al cargar la factura
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default InvoiceModal;
