import CreatePaymentModal from "@/components/CreatePaymentModal";
import PaymentModal from "@/components/PaymentModal";
import { paymentService } from "@/services/payment.service";
import type { Payment } from "@/types/payment";
import { useEffect, useState } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Trash2, Plus, ChevronLeft, ChevronRight } from "lucide-react";

function Pagos() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filtros y paginación
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [clientName, setClientName] = useState("");
  const [orderBy, setOrderBy] = useState<"asc" | "desc">("desc");

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const loadPayments = async () => {
    setIsLoading(true);
    try {
      const response = await paymentService.getAll({
        page,
        limit,
        clientName: clientName || undefined,
        orderBy,
      });
      setPayments(response.data.payments);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error loading payments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [page, clientName, orderBy]);

  const handleView = (paymentId: string) => {
    setSelectedPaymentId(paymentId);
    setIsModalOpen(true);
  };

  const handleDelete = async (paymentId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este pago?")) {
      return;
    }

    try {
      await paymentService.delete(paymentId);
      loadPayments();
    } catch (error) {
      console.error("Error deleting payment:", error);
      alert("Error al eliminar el pago");
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPaymentId(null);
  };

  const handleUpdate = () => {
    loadPayments();
  };

  const handleCreated = () => {
    loadPayments();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMethodLabel = (method: Payment["method"]): string => {
    const labels: Record<Payment["method"], string> = {
      CASH: "Efectivo",
      TRANSFER: "Transferencia",
      CARD: "Tarjeta",
      OTHER: "Otro",
    };
    return labels[method];
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Pagos</h1>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Crear Pago
          </Button>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="clientName">Nombre Cliente</Label>
            <Input
              type="text"
              id="clientName"
              placeholder="Buscar por nombre..."
              value={clientName}
              onChange={(e) => {
                setClientName(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="orderBy">Ordenar por Fecha</Label>
            <Select
              value={orderBy}
              onValueChange={(value) => {
                setOrderBy(value as "asc" | "desc");
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Más recientes</SelectItem>
                <SelectItem value="asc">Más antiguos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabla */}
        {isLoading ? (
          <p className="text-center py-8">Cargando pagos...</p>
        ) : payments.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            No se encontraron pagos
          </p>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Fecha de Pago</TableHead>
                    <TableHead>Notas</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.invoice.client.name}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(Number(payment.amount))}
                      </TableCell>
                      <TableCell>{getMethodLabel(payment.method)}</TableCell>
                      <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                      <TableCell>{payment.notes || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(payment.id)}
                            aria-label="Visualizar pago"
                            title="Visualizar"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(payment.id)}
                            aria-label="Eliminar pago"
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

            {/* Paginación */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Página {pagination.totalPages > 0 ? page : 0} de{" "}
                {pagination.totalPages} ({pagination.total} pagos)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={!pagination.hasPreviousPage || isLoading}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={!pagination.hasNextPage || isLoading}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modales */}
      <PaymentModal
        paymentId={selectedPaymentId}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onUpdate={handleUpdate}
      />

      <CreatePaymentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleCreated}
      />
    </>
  );
}

export default Pagos;
