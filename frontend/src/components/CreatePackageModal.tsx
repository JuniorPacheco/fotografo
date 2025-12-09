import { useState } from "react";
import type { CreatePackageRequest } from "@/types/package";
import { packageService } from "@/services/package.service";
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

interface CreatePackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

function CreatePackageModal({
  isOpen,
  onClose,
  onCreated,
}: CreatePackageModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<CreatePackageRequest>({
    name: "",
    suggestedPrice: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSaving(true);
    try {
      await packageService.create(formData);
      setFormData({
        name: "",
        suggestedPrice: 0,
      });
      onCreated();
      onClose();
    } catch (error) {
      console.error("Error creating package:", error);
      alert("Error al crear el paquete");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crear Paquete</DialogTitle>
          <DialogDescription>
            Completa el formulario para crear un nuevo paquete
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
            <Label htmlFor="create-suggestedPrice">Precio Sugerido *</Label>
            <Input
              type="number"
              id="create-suggestedPrice"
              value={formData.suggestedPrice}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  suggestedPrice: parseFloat(e.target.value) || 0,
                })
              }
              required
              min={0}
              step="0.01"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Creando..." : "Crear Paquete"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreatePackageModal;
