import { useState, useEffect } from "react";
import type { Package, UpdatePackageRequest } from "@/types/package";
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

interface PackageModalProps {
  packageId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

function PackageModal({
  packageId,
  isOpen,
  onClose,
  onUpdate,
}: PackageModalProps) {
  const [package_, setPackage] = useState<Package | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<UpdatePackageRequest>({
    name: "",
    suggestedPrice: 0,
  });

  useEffect(() => {
    if (isOpen && packageId) {
      loadPackage();
    }
  }, [isOpen, packageId]);

  const loadPackage = async () => {
    if (!packageId) return;
    setIsLoading(true);
    try {
      const response = await packageService.getById(packageId);
      const packageData = response.data.package;
      setPackage(packageData);
      setFormData({
        name: packageData.name,
        suggestedPrice: packageData.suggestedPrice,
      });
    } catch (error) {
      console.error("Error loading package:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageId) return;

    setIsSaving(true);
    try {
      await packageService.update(packageId, formData);
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating package:", error);
      alert("Error al actualizar el paquete");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalles de Paquete</DialogTitle>
          <DialogDescription>Edita los detalles del paquete</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="text-center py-4">Cargando...</p>
        ) : package_ ? (
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
              <Label htmlFor="suggestedPrice">Precio Sugerido</Label>
              <Input
                type="number"
                id="suggestedPrice"
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
                {isSaving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        ) : (
          <p className="text-center py-4 text-destructive">
            Error al cargar el paquete
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default PackageModal;
