import { useState } from "react";
import type { CreateClientRequest } from "@/types/client";
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

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (clientId?: string) => void;
}

function CreateClientModal({
  isOpen,
  onClose,
  onCreated,
}: CreateClientModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<CreateClientRequest>({
    name: "",
    phone: "",
    address: "",
    email: "",
    cedula: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSaving(true);
    try {
      const response = await clientService.create(formData);
      const newClientId = response.data.client.id;
      setFormData({
        name: "",
        phone: "",
        address: "",
        email: "",
        cedula: "",
      });
      onCreated(newClientId);
      onClose();
    } catch (error) {
      console.error("Error creating client:", error);
      alert("Error al crear el cliente");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crear Cliente</DialogTitle>
          <DialogDescription>
            Completa el formulario para crear un nuevo cliente
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="create-name">Nombre *</Label>
            <Input
              type="text"
              id="create-name"
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
            <Label htmlFor="create-phone">Teléfono *</Label>
            <Input
              type="text"
              id="create-phone"
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
            <Label htmlFor="create-address">Dirección *</Label>
            <Input
              type="text"
              id="create-address"
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
            <Label htmlFor="create-email">Correo Electrónico</Label>
            <Input
              type="email"
              id="create-email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
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
            <Label htmlFor="create-cedula">Cédula</Label>
            <Input
              type="text"
              id="create-cedula"
              value={formData.cedula}
              onChange={(e) =>
                setFormData({ ...formData, cedula: e.target.value })
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
              {isSaving ? "Creando..." : "Crear Cliente"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateClientModal;
