import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { sessionService } from "@/services/session.service";
import type { Session } from "@/types/session";
import { Calendar, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import CreateSessionModal from "./CreateSessionModal";
import SessionModal from "./SessionModal";

interface InvoiceSessionsModalProps {
  invoiceId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

function InvoiceSessionsModal({
  invoiceId,
  isOpen,
  onClose,
  onUpdate,
}: InvoiceSessionsModalProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [invoiceInfo, setInvoiceInfo] = useState<{
    id: string;
    maxNumberSessions: number;
    totalSessions: number;
    remainingSessions: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen && invoiceId) {
      loadSessions();
    }
  }, [isOpen, invoiceId]);

  const loadSessions = async () => {
    if (!invoiceId) return;
    setIsLoading(true);
    try {
      const response = await sessionService.getByInvoice(invoiceId);
      setSessions(response.data.sessions);
      setInvoiceInfo(response.data.invoice);
    } catch (error) {
      console.error("Error loading sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setIsSessionModalOpen(true);
  };

  const handleDelete = async (sessionId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta sesión?")) {
      return;
    }

    try {
      await sessionService.delete(sessionId);
      loadSessions();
      onUpdate();
    } catch (error) {
      console.error("Error deleting session:", error);
      alert("Error al eliminar la sesión");
    }
  };

  const handleSessionModalClose = () => {
    setIsSessionModalOpen(false);
    setSelectedSessionId(null);
  };

  const handleSessionUpdate = () => {
    loadSessions();
    onUpdate();
  };

  const handleCreated = () => {
    loadSessions();
    onUpdate();
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusLabel = (status: Session["status"]): string => {
    const labels: Record<Session["status"], string> = {
      SCHEDULED: "Programada",
      COMPLETED_UNCLAIMED: "Completada sin Reclamar",
      COMPLETED_AND_CLAIMED: "Completada y Reclamada",
      CANCELLED: "Cancelada",
    };
    return labels[status];
  };

  const getStatusVariant = (
    status: Session["status"]
  ): "default" | "secondary" | "destructive" | "outline" => {
    const variants: Record<
      Session["status"],
      "default" | "secondary" | "destructive" | "outline"
    > = {
      SCHEDULED: "default",
      COMPLETED_UNCLAIMED: "secondary",
      COMPLETED_AND_CLAIMED: "outline",
      CANCELLED: "destructive",
    };
    return variants[status];
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sesiones de la Factura</DialogTitle>
            <DialogDescription>
              Gestiona las sesiones asociadas a esta factura
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <p className="text-center py-4">Cargando sesiones...</p>
          ) : invoiceInfo ? (
            <>
              {/* Resumen de sesiones */}
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Sesiones Máximas
                      </p>
                      <p className="text-lg font-semibold">
                        {invoiceInfo.maxNumberSessions}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Sesiones Creadas
                      </p>
                      <p className="text-lg font-semibold">
                        {invoiceInfo.totalSessions}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Sesiones Restantes
                      </p>
                      <p
                        className={`text-lg font-semibold ${
                          invoiceInfo.remainingSessions > 0
                            ? "text-green-600"
                            : "text-destructive"
                        }`}
                      >
                        {invoiceInfo.remainingSessions}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Botón para crear sesión */}
              <div className="flex justify-end">
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  disabled={invoiceInfo.remainingSessions === 0}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Sesión
                </Button>
              </div>
              {invoiceInfo.remainingSessions === 0 && (
                <p className="text-sm text-muted-foreground text-center">
                  Se ha alcanzado el límite máximo de sesiones para esta factura
                </p>
              )}

              {/* Tabla de sesiones */}
              {sessions.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No hay sesiones registradas para esta factura
                </p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead># Sesión</TableHead>
                        <TableHead>Fecha Programada</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fotos Seleccionadas</TableHead>
                        <TableHead>Notas</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessions.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell className="font-medium">
                            {session.sessionNumber}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {formatDate(session.scheduledAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(session.status)}>
                              {getStatusLabel(session.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {session.selectedPhotos.length > 0
                              ? `${session.selectedPhotos.length} foto(s)`
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {session.notes ? (
                              <span className="truncate max-w-xs block">
                                {session.notes}
                              </span>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleView(session.id)}
                                aria-label="Editar sesión"
                                title="Editar"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(session.id)}
                                aria-label="Eliminar sesión"
                                title="Eliminar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          ) : (
            <p className="text-center py-4 text-destructive">
              Error al cargar las sesiones
            </p>
          )}
        </DialogContent>
      </Dialog>

      {/* Modales anidados */}
      <SessionModal
        sessionId={selectedSessionId}
        isOpen={isSessionModalOpen}
        onClose={handleSessionModalClose}
        onUpdate={handleSessionUpdate}
      />

      <CreateSessionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleCreated}
        invoiceId={invoiceId || undefined}
      />
    </>
  );
}

export default InvoiceSessionsModal;
