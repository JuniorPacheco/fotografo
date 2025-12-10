import { clientService } from "@/services/client.service";
import { packageService } from "@/services/package.service";
import { invoiceService } from "@/services/invoice.service";
import { Client } from "@/types/client";
import { Package } from "@/types/package";
import type { CreateInvoiceRequest } from "@/types/invoice";
import { useState, useEffect } from "react";
import CreateClientModal from "./CreateClientModal";
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

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

function CreateInvoiceModal({
  isOpen,
  onClose,
  onCreated,
}: CreateInvoiceModalProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateClientModalOpen, setIsCreateClientModalOpen] = useState(false);
  const [formData, setFormData] = useState<CreateInvoiceRequest>({
    clientId: "",
    packageId: null,
    totalAmount: 0,
    maxNumberSessions: 1,
    photosFolderPath: "",
    notes: "",
    status: "PENDING",
  });

  useEffect(() => {
    if (isOpen) {
      loadClients();
      loadPackages();
    }
  }, [isOpen]);

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

  const handleClientCreated = (newClientId?: string) => {
    loadClients();
    // Seleccionar el nuevo cliente creado si se proporciona el ID
    if (newClientId) {
      setFormData({ ...formData, clientId: newClientId });
    }
    setIsCreateClientModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Asegurar que el status siempre sea PENDING (aunque el backend lo fuerza)
      // Convertir totalAmount y maxNumberSessions a números explícitamente
      const submitData = {
        ...formData,
        totalAmount: Number(formData.totalAmount),
        maxNumberSessions: Number(formData.maxNumberSessions) || 1,
        status: "PENDING" as const,
      };
      await invoiceService.create(submitData);
      onCreated();
      onClose();
      // Reset form
      setFormData({
        clientId: "",
        packageId: null,
        totalAmount: 0,
        maxNumberSessions: 1,
        photosFolderPath: "",
        notes: "",
        status: "PENDING",
      });
    } catch (error) {
      console.error("Error creating invoice:", error);
      alert("Error al crear la factura");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nueva Factura</DialogTitle>
            <DialogDescription>
              Completa el formulario para crear una nueva factura
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-clientId">Cliente *</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.clientId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, clientId: value })
                  }
                  required
                >
                  <SelectTrigger className="flex-1">
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateClientModalOpen(true)}
                  aria-label="Crear nuevo cliente"
                  title="Crear nuevo cliente"
                >
                  + Nuevo
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-packageId">Paquete</Label>
              <Select
                value={formData.packageId || "__none__"}
                onValueChange={(value) => {
                  if (value === "__none__") {
                    setFormData({
                      ...formData,
                      packageId: null,
                    });
                  } else {
                    const selectedPackage = packages.find(
                      (pkg) => pkg.id === value
                    );
                    setFormData({
                      ...formData,
                      packageId: value,
                      totalAmount: selectedPackage
                        ? selectedPackage.suggestedPrice
                        : formData.totalAmount,
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
                      {pkg.name} - ${pkg.suggestedPrice.toLocaleString("es-CO")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-totalAmount">Monto Total *</Label>
              <Input
                type="number"
                id="create-totalAmount"
                step="0.01"
                min="0.01"
                value={formData.totalAmount || ""}
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
              <Label htmlFor="create-maxNumberSessions">
                Máximo de Sesiones
              </Label>
              <Input
                type="number"
                id="create-maxNumberSessions"
                min="1"
                max="100"
                value={formData.maxNumberSessions}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxNumberSessions: parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-photosFolderPath">
                Ruta de Carpeta de Fotos
              </Label>
              <Input
                type="text"
                id="create-photosFolderPath"
                value={formData.photosFolderPath || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    photosFolderPath: e.target.value,
                  })
                }
                placeholder="C:\Fotos\Cliente123"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-status">Estado</Label>
              <Select
                value={formData.status}
                disabled
                onValueChange={() => {
                  // No permitir cambio - siempre PENDING
                }}
              >
                <SelectTrigger className="bg-muted">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pendiente</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Las facturas siempre se crean con estado "Pendiente"
              </p>
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
                {isLoading ? "Creando..." : "Crear Factura"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para crear cliente */}
      <CreateClientModal
        isOpen={isCreateClientModalOpen}
        onClose={() => setIsCreateClientModalOpen(false)}
        onCreated={handleClientCreated}
      />
    </>
  );
}

export default CreateInvoiceModal;
