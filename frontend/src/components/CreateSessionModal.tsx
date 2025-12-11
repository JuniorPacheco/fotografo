import { sessionService } from "@/services/session.service";
import type { CreateSessionRequest } from "@/types/session";
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
import { X } from "lucide-react";

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  invoiceId?: string; // Si se proporciona, no se muestra el selector de factura
}

function CreateSessionModal({
  isOpen,
  onClose,
  onCreated,
  invoiceId,
}: CreateSessionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [photoInputs, setPhotoInputs] = useState<string[]>([]);
  const [formData, setFormData] = useState<CreateSessionRequest>({
    invoiceId: invoiceId || "",
    sessionNumber: undefined,
    scheduledAt: "",
    status: "SCHEDULED",
    selectedPhotos: [],
    notes: "",
  });

  useEffect(() => {
    if (isOpen) {
      if (invoiceId) {
        setFormData((prev) => ({ ...prev, invoiceId }));
      }
      // Reset form
      setFormData({
        invoiceId: invoiceId || "",
        sessionNumber: undefined,
        scheduledAt: "",
        status: "SCHEDULED",
        selectedPhotos: [],
        notes: "",
      });
      setPhotoInputs([]);
    }
  }, [isOpen, invoiceId]);

  const handleAddPhotoField = () => {
    setPhotoInputs([...photoInputs, ""]);
  };

  const handlePhotoChange = (index: number, value: string) => {
    const newInputs = [...photoInputs];
    newInputs[index] = value;
    setPhotoInputs(newInputs);

    // Actualizar selectedPhotos eliminando duplicados
    const uniquePhotos = Array.from(
      new Set(newInputs.filter((photo) => photo.trim() !== ""))
    );
    setFormData({ ...formData, selectedPhotos: uniquePhotos });
  };

  const handleRemovePhotoField = (index: number) => {
    const newInputs = photoInputs.filter((_, i) => i !== index);
    setPhotoInputs(newInputs);

    // Actualizar selectedPhotos
    const uniquePhotos = Array.from(
      new Set(newInputs.filter((photo) => photo.trim() !== ""))
    );
    setFormData({ ...formData, selectedPhotos: uniquePhotos });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Validar que no haya fotos duplicadas
      const uniquePhotos = Array.from(
        new Set(photoInputs.filter((photo) => photo.trim() !== ""))
      );

      if (
        uniquePhotos.length !==
        photoInputs.filter((p) => p.trim() !== "").length
      ) {
        alert("No se permiten fotos duplicadas");
        setIsLoading(false);
        return;
      }

      // Convertir scheduledAt a formato ISO si existe
      const submitData: CreateSessionRequest = {
        ...formData,
        selectedPhotos: uniquePhotos,
        scheduledAt: formData.scheduledAt
          ? new Date(formData.scheduledAt).toISOString()
          : undefined,
        sessionNumber:
          formData.sessionNumber && formData.sessionNumber > 0
            ? formData.sessionNumber
            : undefined,
        notes: formData.notes || undefined,
      };
      await sessionService.create(submitData);
      setFormData({
        invoiceId: invoiceId || "",
        sessionNumber: undefined,
        scheduledAt: "",
        status: "SCHEDULED",
        selectedPhotos: [],
        notes: "",
      });
      onCreated();
      onClose();
    } catch (error) {
      console.error("Error creating session:", error);
      alert(
        error instanceof Error ? error.message : "Error al crear la sesión"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Convertir datetime-local a formato compatible
  const getLocalDateTimeString = (dateTime: string): string => {
    if (!dateTime) return "";
    // Si ya está en formato datetime-local, retornarlo
    if (dateTime.includes("T") && !dateTime.includes("Z")) {
      return dateTime;
    }
    // Si está en formato ISO, convertir a datetime-local
    if (dateTime.includes("T")) {
      const date = new Date(dateTime);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    return dateTime;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Sesión</DialogTitle>
          <DialogDescription>
            Completa el formulario para crear una nueva sesión
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="create-sessionNumber">
              Número de Sesión (Opcional)
            </Label>
            <Input
              type="number"
              id="create-sessionNumber"
              min="1"
              value={formData.sessionNumber || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sessionNumber:
                    e.target.value === ""
                      ? undefined
                      : parseInt(e.target.value, 10),
                })
              }
              placeholder="Se asignará automáticamente si se deja vacío"
            />
            <p className="text-xs text-muted-foreground">
              Si no se especifica, se asignará automáticamente el siguiente
              número disponible
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-scheduledAt">Fecha y Hora Programada</Label>
            <Input
              type="datetime-local"
              id="create-scheduledAt"
              value={getLocalDateTimeString(formData.scheduledAt || "")}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  scheduledAt: e.target.value,
                })
              }
            />
            <p className="text-xs text-muted-foreground">
              Si se especifica una fecha, se creará automáticamente un evento en
              Google Calendar (si está conectado)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-status">Estado</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  status: value as CreateSessionRequest["status"],
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SCHEDULED">Programada</SelectItem>
                <SelectItem value="COMPLETED_UNCLAIMED">
                  Completada sin Reclamar
                </SelectItem>
                <SelectItem value="COMPLETED_AND_CLAIMED">
                  Completada y Reclamada
                </SelectItem>
                <SelectItem value="CANCELLED">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Fotos Seleccionadas (Opcional)</Label>
            <div className="space-y-2">
              {photoInputs.map((photo, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="text"
                    value={photo}
                    onChange={(e) => handlePhotoChange(index, e.target.value)}
                    placeholder="Identificador de foto"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemovePhotoField(index)}
                    aria-label="Eliminar foto"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={handleAddPhotoField}
                className="w-full"
              >
                Agregar Foto
              </Button>
            </div>
            {(formData.selectedPhotos?.length ?? 0) > 0 && (
              <p className="text-xs text-muted-foreground">
                {formData.selectedPhotos?.length ?? 0} foto(s) agregada(s)
              </p>
            )}
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
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground">
              Máximo 1000 caracteres
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creando..." : "Crear Sesión"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateSessionModal;
