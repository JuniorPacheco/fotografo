import { useState, useEffect } from "react";
import type { Reminder } from "@/types/reminder";
import { reminderService } from "@/services/reminder.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Calendar,
} from "lucide-react";

function Recordatorios() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filtros y paginación
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [clientName, setClientName] = useState("");

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
  });

  const loadReminders = async () => {
    setIsLoading(true);
    try {
      const response = await reminderService.getAll({
        page,
        limit,
        clientName: clientName || undefined,
      });
      setReminders(response.data.reminders);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error loading reminders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReminders();
  }, [page, clientName]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /**
   * Determina el estado de la fecha del recordatorio
   */
  const getDateStatus = (dateString: string): "past" | "today" | "upcoming" => {
    const reminderDate = new Date(dateString);
    const today = new Date();

    // Normalizar fechas para comparar solo día, mes y año
    const reminderDateNormalized = new Date(
      reminderDate.getFullYear(),
      reminderDate.getMonth(),
      reminderDate.getDate()
    );
    const todayNormalized = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    if (reminderDateNormalized < todayNormalized) {
      return "past";
    } else if (reminderDateNormalized.getTime() === todayNormalized.getTime()) {
      return "today";
    } else {
      return "upcoming";
    }
  };

  /**
   * Obtiene el badge para el estado de la fecha
   */
  const getDateStatusBadge = (dateString: string) => {
    const status = getDateStatus(dateString);

    switch (status) {
      case "past":
        return (
          <Badge variant="secondary" className="bg-gray-500">
            Pasado
          </Badge>
        );
      case "today":
        return (
          <Badge variant="default" className="bg-blue-500">
            Hoy
          </Badge>
        );
      case "upcoming":
        return (
          <Badge variant="default" className="bg-green-500">
            Próximo
          </Badge>
        );
    }
  };

  /**
   * Obtiene el badge para el estado de envío
   */
  const getSentStatusBadge = (isSent: boolean) => {
    if (isSent) {
      return (
        <Badge variant="default" className="bg-green-600">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Enviado
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="bg-gray-400">
          <XCircle className="h-3 w-3 mr-1" />
          Pendiente
        </Badge>
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Recordatorios</h1>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="clientName">Nombre del Cliente</Label>
          <Input
            type="text"
            id="clientName"
            placeholder="Buscar por nombre de cliente..."
            value={clientName}
            onChange={(e) => {
              setClientName(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Tabla */}
      {isLoading ? (
        <p className="text-center py-8">Cargando recordatorios...</p>
      ) : reminders.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">
          No se encontraron recordatorios
        </p>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha del Recordatorio</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Estado de Fecha</TableHead>
                  <TableHead>Estado de Envío</TableHead>
                  <TableHead>Fecha de Envío</TableHead>
                  <TableHead>Fecha de Creación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reminders.map((reminder) => (
                  <TableRow key={reminder.id}>
                    <TableCell className="font-medium">
                      {reminder.clientName}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(reminder.date)}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <p className="truncate" title={reminder.description}>
                        {reminder.description}
                      </p>
                    </TableCell>
                    <TableCell>{getDateStatusBadge(reminder.date)}</TableCell>
                    <TableCell>{getSentStatusBadge(reminder.isSent)}</TableCell>
                    <TableCell>
                      {reminder.sentAt ? formatDateTime(reminder.sentAt) : "-"}
                    </TableCell>
                    <TableCell>{formatDate(reminder.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Página {pagination.totalPages > 0 ? page : 0} de{" "}
              {pagination.totalPages} ({pagination.total} recordatorios)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= pagination.totalPages || isLoading}
              >
                Siguiente
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Recordatorios;
