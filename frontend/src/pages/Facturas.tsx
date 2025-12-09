import { useState, useEffect } from "react";
import type { Invoice } from "@/types/invoice";
import { invoiceService } from "@/services/invoice.service";
import InvoiceModal from "@/components/InvoiceModal";
import CreateInvoiceModal from "@/components/CreateInvoiceModal";
import InvoicePaymentsModal from "@/components/InvoicePaymentsModal";
import InvoiceSessionsModal from "@/components/InvoiceSessionsModal";
import DailySalesModal from "@/components/DailySalesModal";
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
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  DollarSign,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Printer,
} from "lucide-react";

function Facturas() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null
  );
  const [selectedInvoiceIdForPayments, setSelectedInvoiceIdForPayments] =
    useState<string | null>(null);
  const [selectedInvoiceIdForSessions, setSelectedInvoiceIdForSessions] =
    useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPaymentsModalOpen, setIsPaymentsModalOpen] = useState(false);
  const [isSessionsModalOpen, setIsSessionsModalOpen] = useState(false);
  const [isDailySalesModalOpen, setIsDailySalesModalOpen] = useState(false);

  // Filtros y paginación
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [clientName, setClientName] = useState("");
  const [orderBy, setOrderBy] = useState<"asc" | "desc">("desc");

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const loadInvoices = async () => {
    setIsLoading(true);
    try {
      const response = await invoiceService.getAll({
        page,
        limit,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        clientName: clientName || undefined,
        orderBy,
      });
      setInvoices(response.data.invoices);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error loading invoices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [page, startDate, endDate, clientName, orderBy]);

  const handleView = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setIsModalOpen(true);
  };

  const handleViewPayments = (invoiceId: string) => {
    setSelectedInvoiceIdForPayments(invoiceId);
    setIsPaymentsModalOpen(true);
  };

  const handleViewSessions = (invoiceId: string) => {
    setSelectedInvoiceIdForSessions(invoiceId);
    setIsSessionsModalOpen(true);
  };

  const handleDelete = async (invoiceId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta factura?")) {
      return;
    }

    try {
      await invoiceService.delete(invoiceId);
      loadInvoices();
    } catch (error) {
      console.error("Error deleting invoice:", error);
      alert("Error al eliminar la factura");
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedInvoiceId(null);
  };

  const handleUpdate = () => {
    loadInvoices();
  };

  const handleCreated = () => {
    loadInvoices();
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
    });
  };

  const getStatusLabel = (status: Invoice["status"]): string => {
    const labels: Record<Invoice["status"], string> = {
      PENDING: "Pendiente",
      IN_PROGRESS: "En Progreso",
      COMPLETED: "Completado",
      CANCELLED: "Cancelado",
    };
    return labels[status];
  };

  const getStatusVariant = (
    status: Invoice["status"]
  ): "default" | "secondary" | "destructive" | "outline" => {
    const variants: Record<
      Invoice["status"],
      "default" | "secondary" | "destructive" | "outline"
    > = {
      PENDING: "secondary",
      IN_PROGRESS: "default",
      COMPLETED: "default",
      CANCELLED: "destructive",
    };
    return variants[status];
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Facturas</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDailySalesModalOpen(true)}
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir Ventas
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Factura
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Fecha Inicio</Label>
            <Input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">Fecha Fin</Label>
            <Input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
            />
          </div>

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
                <SelectItem value="asc">Más antiguas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabla */}
        {isLoading ? (
          <p className="text-center py-8">Cargando facturas...</p>
        ) : invoices.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            No se encontraron facturas
          </p>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Monto Total</TableHead>
                    <TableHead>Pagado</TableHead>
                    <TableHead>Pendiente</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Sesiones</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.client.name}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(Number(invoice.totalAmount))}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(invoice.paidAmount)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(invoice.remainingAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(invoice.status)}>
                          {getStatusLabel(invoice.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {invoice._count.sessions} / {invoice.maxNumberSessions}
                      </TableCell>
                      <TableCell>{formatDate(invoice.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(invoice.id)}
                            aria-label="Visualizar factura"
                            title="Visualizar"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewPayments(invoice.id)}
                            aria-label="Ver pagos"
                            title="Ver Pagos"
                          >
                            <DollarSign className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewSessions(invoice.id)}
                            aria-label="Ver sesiones"
                            title="Ver Sesiones"
                          >
                            <Calendar className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(invoice.id)}
                            aria-label="Eliminar factura"
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
                {pagination.totalPages} ({pagination.total} facturas)
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
      <InvoiceModal
        invoiceId={selectedInvoiceId}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onUpdate={handleUpdate}
      />

      <CreateInvoiceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleCreated}
      />

      <InvoicePaymentsModal
        invoiceId={selectedInvoiceIdForPayments}
        isOpen={isPaymentsModalOpen}
        onClose={() => {
          setIsPaymentsModalOpen(false);
          setSelectedInvoiceIdForPayments(null);
        }}
        onUpdate={handleUpdate}
      />

      <InvoiceSessionsModal
        invoiceId={selectedInvoiceIdForSessions}
        isOpen={isSessionsModalOpen}
        onClose={() => {
          setIsSessionsModalOpen(false);
          setSelectedInvoiceIdForSessions(null);
        }}
        onUpdate={handleUpdate}
      />

      <DailySalesModal
        isOpen={isDailySalesModalOpen}
        onClose={() => setIsDailySalesModalOpen(false)}
      />
    </>
  );
}

export default Facturas;
