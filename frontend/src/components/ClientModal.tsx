import { useState, useEffect } from "react";
import type { Client, UpdateClientRequest } from "@/types/client";
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

interface ClientModalProps {
  clientId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

function ClientModal({
  clientId,
  isOpen,
  onClose,
  onUpdate,
}: ClientModalProps) {
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<UpdateClientRequest>({
    name: "",
    phone: "",
    address: "",
    email: null,
    cedula: null,
  });

  useEffect(() => {
    if (isOpen && clientId) {
      loadClient();
    }
  }, [isOpen, clientId]);

  const loadClient = async () => {
    if (!clientId) return;
    setIsLoading(true);
    try {
      const response = await clientService.getById(clientId);
      const clientData = response.data.client;
      setClient(clientData);
      setFormData({
        name: clientData.name,
        phone: clientData.phone,
        address: clientData.address,
        email: clientData.email,
        cedula: clientData.cedula,
      });
    } catch (error) {
      console.error("Error loading client:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) return;

    setIsSaving(true);
    try {
      await clientService.update(clientId, formData);
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating client:", error);
      alert("Error al actualizar el cliente");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalles de Cliente</DialogTitle>
          <DialogDescription>Edita los detalles del cliente</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="text-center py-4">Cargando...</p>
        ) : client ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                minLength={1}
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                type="text"
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
                minLength={1}
                maxLength={20}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                type="text"
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                required
                minLength={1}
                maxLength={500}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                type="email"
                id="email"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value || null,
                  })
                }
                maxLength={255}
                placeholder="Opcional"
              />
              <p className="text-sm text-muted-foreground">
                Si no agregas correo del cliente no podrá recibir los
                recordatorios y alertas generadas por la aplicación
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cedula">Cédula</Label>
              <Input
                type="text"
                id="cedula"
                value={formData.cedula || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cedula: e.target.value || null,
                  })
                }
                maxLength={20}
                placeholder="Opcional"
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
            Error al cargar el cliente
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ClientModal;
