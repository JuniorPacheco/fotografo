import { useState, useEffect } from "react";
import type { Invoice, UpdateInvoiceRequest } from "@/types/invoice";
import type { Client } from "@/types/client";
import type { Package } from "@/types/package";
import { invoiceService } from "@/services/invoice.service";
import { clientService } from "@/services/client.service";
import { packageService } from "@/services/package.service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<
    Invoice["status"] | null
  >(null);
  const [formData, setFormData] = useState<UpdateInvoiceRequest>({
    clientId: "",
    packageId: null,
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
      loadPackages();
    } else if (!isOpen) {
      // Resetear estados cuando se cierra el modal
      setShowConfirmDialog(false);
      setPendingStatusChange(null);
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
        packageId: invoiceData.packageId || null,
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

  const loadPackages = async () => {
    try {
      const response = await packageService.getAll({ limit: 1000 });
      setPackages(response.data.packages);
    } catch (error) {
      console.error("Error loading packages:", error);
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

  const handleConfirmStatusChange = () => {
    if (pendingStatusChange) {
      setFormData({
        ...formData,
        status: pendingStatusChange,
      });
      setShowConfirmDialog(false);
      setPendingStatusChange(null);
    }
  };

  const handleCancelStatusChange = () => {
    setShowConfirmDialog(false);
    setPendingStatusChange(null);
    // No necesitamos revertir porque el formData.status nunca cambió
  };

  return (
    <>
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
                <Label htmlFor="packageId">Paquete</Label>
                <Select
                  value={formData.packageId || "__none__"}
                  onValueChange={(value) => {
                    if (value === "__none__") {
                      setFormData({
                        ...formData,
                        packageId: null,
                      });
                    } else {
                      setFormData({
                        ...formData,
                        packageId: value,
                        // No modificamos el monto total al cambiar el paquete
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar paquete (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Ninguno</SelectItem>
                    {packages.map((pkg) => (
                      <SelectItem key={pkg.id} value={pkg.id}>
                        {pkg.name} - $
                        {pkg.suggestedPrice.toLocaleString("es-CO")}
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
                <Label htmlFor="photosFolderPath">
                  Ruta de Carpeta de Fotos
                </Label>
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
                  onValueChange={(value) => {
                    const newStatus = value as Invoice["status"];
                    // Si se intenta cambiar a COMPLETED_AND_CLAIMED, mostrar confirmación
                    if (
                      newStatus === "COMPLETED_AND_CLAIMED" &&
                      invoice?.status !== "COMPLETED_AND_CLAIMED"
                    ) {
                      setPendingStatusChange(newStatus);
                      setShowConfirmDialog(true);
                    } else {
                      setFormData({
                        ...formData,
                        status: newStatus,
                      });
                    }
                  }}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pendiente</SelectItem>
                    <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                    <SelectItem value="COMPLETED_PENDING_PHOTOS">
                      Completado - Pendiente Fotos
                    </SelectItem>
                    <SelectItem value="COMPLETED_PHOTOS_READY">
                      Completado - Fotos Listas
                    </SelectItem>
                    <SelectItem value="COMPLETED_AND_CLAIMED">
                      Completado y Reclamado
                    </SelectItem>
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

      {/* Modal de confirmación para cambio a COMPLETED_AND_CLAIMED */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Cambio de Estado</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas cambiar el estado a "Completado y
              Reclamado"?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Al cambiar a este estado, se eliminarán{" "}
              <strong>todos los recordatorios</strong> relacionados con esta
              factura y sus sesiones, ya que el cliente ha completado y
              reclamado todo el trabajo.
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Advertencia:</strong> Esta acción no se puede deshacer.
                Todos los recordatorios pendientes serán eliminados
                permanentemente.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelStatusChange}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmStatusChange}
              className="bg-destructive hover:bg-destructive/90"
            >
              Confirmar y Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default InvoiceModal;
