import { sessionService } from "@/services/session.service";
import type { Session, UpdateSessionRequest } from "@/types/session";
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

interface SessionModalProps {
  sessionId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

function SessionModal({
  sessionId,
  isOpen,
  onClose,
  onUpdate,
}: SessionModalProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [photoInputs, setPhotoInputs] = useState<string[]>([]);
  const [formData, setFormData] = useState<UpdateSessionRequest>({
    sessionNumber: undefined,
    scheduledAt: null,
    status: "SCHEDULED",
    selectedPhotos: [],
    notes: null,
  });

  useEffect(() => {
    if (isOpen && sessionId) {
      loadSession();
    }
  }, [isOpen, sessionId]);

  const loadSession = async () => {
    if (!sessionId) return;
    setIsLoading(true);
    try {
      const response = await sessionService.getById(sessionId);
      const sessionData = response.data.session;
      setSession(sessionData);
      setFormData({
        sessionNumber: sessionData.sessionNumber,
        scheduledAt: sessionData.scheduledAt
          ? convertFromISOToLocal(sessionData.scheduledAt)
          : null,
        status: sessionData.status,
        selectedPhotos: sessionData.selectedPhotos,
        notes: sessionData.notes,
      });
      // Inicializar photoInputs con las fotos existentes
      setPhotoInputs(sessionData.selectedPhotos);
    } catch (error) {
      console.error("Error loading session:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
    if (!sessionId) return;

    setIsSaving(true);
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
        setIsSaving(false);
        return;
      }

      // Convertir scheduledAt a formato ISO si existe, considerando zona horaria de Colombia
      const submitData: UpdateSessionRequest = {
        ...formData,
        selectedPhotos: uniquePhotos,
        scheduledAt: formData.scheduledAt
          ? convertToColombiaISO(formData.scheduledAt)
          : null,
        sessionNumber:
          formData.sessionNumber && formData.sessionNumber > 0
            ? formData.sessionNumber
            : undefined,
        notes: formData.notes || null,
      };
      await sessionService.update(sessionId, submitData);
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating session:", error);
      alert(
        error instanceof Error ? error.message : "Error al actualizar la sesión"
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Convertir datetime-local a ISO string considerando zona horaria de Colombia
  const convertToColombiaISO = (dateTimeLocal: string): string => {
    // El formato datetime-local es "YYYY-MM-DDTHH:mm"
    // Lo interpretamos como hora de Colombia (America/Bogota, UTC-5)
    // Agregamos segundos y el offset de Colombia para crear un string ISO válido
    const dateTimeWithOffset = `${dateTimeLocal}:00-05:00`;
    const date = new Date(dateTimeWithOffset);
    return date.toISOString();
  };

  // Convertir ISO string a datetime-local para el input
  const convertFromISOToLocal = (isoString: string): string => {
    // Convertir ISO a hora de Colombia usando Intl.DateTimeFormat
    const date = new Date(isoString);
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Bogota",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const parts = formatter.formatToParts(date);
    const year = parts.find((p) => p.type === "year")?.value;
    const month = parts.find((p) => p.type === "month")?.value;
    const day = parts.find((p) => p.type === "day")?.value;
    const hours = parts.find((p) => p.type === "hour")?.value;
    const minutes = parts.find((p) => p.type === "minute")?.value;

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Bogota",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles de Sesión</DialogTitle>
          <DialogDescription>Edita los detalles de la sesión</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="text-center py-4">Cargando...</p>
        ) : session ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {session.invoice?.client && (
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  <strong>Cliente:</strong> {session.invoice.client.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Teléfono:</strong> {session.invoice.client.phone}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="sessionNumber">Número de Sesión</Label>
              <Input
                type="number"
                id="sessionNumber"
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Fecha y Hora Programada</Label>
              <Input
                type="datetime-local"
                id="scheduledAt"
                value={formData.scheduledAt || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    scheduledAt: e.target.value || null,
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Si se especifica una fecha, se creará/actualizará
                automáticamente un evento en Google Calendar (si está conectado)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    status: value as Session["status"],
                  })
                }
                required
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
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground">
                Máximo 1000 caracteres
              </p>
            </div>

            {session.googleEventId && (
              <div className="space-y-2">
                <Label>Evento de Google Calendar</Label>
                <div className="text-sm text-muted-foreground">
                  Evento sincronizado con Google Calendar
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                <strong>Creada:</strong> {formatDate(session.createdAt)}
              </p>
              <p>
                <strong>Última actualización:</strong>{" "}
                {formatDate(session.updatedAt)}
              </p>
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
            Error al cargar la sesión
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default SessionModal;
