import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success === "true") {
      setStatus("success");
      setMessage("Google Calendar conectado exitosamente");
      // Redirigir al dashboard después de 2 segundos
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } else if (error) {
      setStatus("error");
      setMessage(decodeURIComponent(error));
    } else {
      setStatus("error");
      setMessage("No se recibió respuesta del servidor");
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Conectando Google Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          {status === "loading" && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Procesando autorización de Google Calendar...
              </p>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p className="font-medium">{message}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Redirigiendo al dashboard...
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-red-600">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <p className="font-medium">Error</p>
              </div>
              <p className="text-sm text-muted-foreground">{message}</p>
              <button
                onClick={() => navigate("/")}
                className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Volver al Dashboard
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default GoogleCallback;
