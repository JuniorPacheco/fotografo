import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { googleCalendarService } from "@/services/googleCalendar.service";
import type { GoogleCalendarStatus } from "@/services/googleCalendar.service";
import { Calendar, CheckCircle2, XCircle, Loader2 } from "lucide-react";

function Dashboard() {
  const { user } = useAuth();
  const [calendarStatus, setCalendarStatus] =
    useState<GoogleCalendarStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const isOwner = user?.role === "OWNER";

  useEffect(() => {
    if (isOwner) {
      loadCalendarStatus();
    } else {
      setIsLoading(false);
    }
  }, [isOwner]);

  const loadCalendarStatus = async () => {
    try {
      setIsLoading(true);
      const response = await googleCalendarService.getStatus();
      setCalendarStatus(response.data);
    } catch (error) {
      console.error("Error loading calendar status:", error);
      setCalendarStatus({
        connected: false,
        calendarId: null,
        calendarName: null,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      const response = await googleCalendarService.getAuthUrl();
      // Redirigir a Google OAuth
      window.location.href = response.data.authUrl;
    } catch (error) {
      console.error("Error getting auth URL:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Error al obtener la URL de autorización"
      );
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (
      !confirm(
        "¿Estás seguro de que deseas desconectar Google Calendar? Esto eliminará todos los tokens almacenados."
      )
    ) {
      return;
    }

    try {
      setIsDisconnecting(true);
      await googleCalendarService.disconnect();
      await loadCalendarStatus();
    } catch (error) {
      console.error("Error disconnecting calendar:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Error al desconectar Google Calendar"
      );
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido, <strong>{user?.name || user?.email}</strong>
        </p>
      </div>

      {isOwner && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Google Calendar
            </CardTitle>
            <CardDescription>
              Conecta tu cuenta de Google Calendar para sincronizar
              automáticamente las sesiones programadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Cargando estado de conexión...</span>
              </div>
            ) : calendarStatus?.connected ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Google Calendar Conectado</span>
                </div>
                {calendarStatus.calendarName && (
                  <p className="text-sm text-muted-foreground">
                    Calendario: <strong>{calendarStatus.calendarName}</strong>
                  </p>
                )}
                <Button
                  onClick={handleDisconnect}
                  disabled={isDisconnecting}
                  variant="destructive"
                  className="w-full sm:w-auto"
                >
                  {isDisconnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Desconectando...
                    </>
                  ) : (
                    "Desconectar Google Calendar"
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <XCircle className="w-5 h-5" />
                  <span>Google Calendar No conectado</span>
                </div>
                <Button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="w-full sm:w-auto"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4 mr-2" />
                      Conectar Google Calendar
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Resumen General</CardTitle>
          <CardDescription>
            Aquí se mostrará un resumen general del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            El dashboard está en desarrollo. Próximamente se mostrarán
            estadísticas y métricas importantes del sistema.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default Dashboard;
