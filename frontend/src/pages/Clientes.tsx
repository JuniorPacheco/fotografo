import { useState, useEffect } from "react";
import type { Client } from "@/types/client";
import { clientService } from "@/services/client.service";
import ClientModal from "@/components/ClientModal";
import CreateClientModal from "@/components/CreateClientModal";
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

function Clientes() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filtros y paginación
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [name, setName] = useState("");
  const [orderBy, setOrderBy] = useState<"asc" | "desc">("desc");

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const loadClients = async () => {
    setIsLoading(true);
    try {
      const response = await clientService.getAll({
        page,
        limit,
        name: name || undefined,
        orderBy,
      });
      setClients(response.data.clients);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error loading clients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, [page, name, orderBy]);

  const handleView = (clientId: string) => {
    setSelectedClientId(clientId);
    setIsModalOpen(true);
  };

  const handleDelete = async (clientId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este cliente?")) {
      return;
    }

    try {
      await clientService.delete(clientId);
      loadClients();
    } catch (error) {
      console.error("Error deleting client:", error);
      alert("Error al eliminar el cliente");
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedClientId(null);
  };

  const handleUpdate = () => {
    loadClients();
  };

  const handleCreated = () => {
    loadClients();
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Clientes</h1>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Crear Cliente
          </Button>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              type="text"
              id="name"
              placeholder="Buscar por nombre..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
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
          <p className="text-center py-8">Cargando clientes...</p>
        ) : clients.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            No se encontraron clientes
          </p>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Correo</TableHead>
                    <TableHead>Dirección</TableHead>
                    <TableHead>Cédula</TableHead>
                    <TableHead>Fecha de Creación</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">
                        {client.name}
                      </TableCell>
                      <TableCell>{client.phone}</TableCell>
                      <TableCell>{client.email || "-"}</TableCell>
                      <TableCell>{client.address}</TableCell>
                      <TableCell>{client.cedula || "-"}</TableCell>
                      <TableCell>{formatDate(client.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(client.id)}
                            aria-label="Visualizar cliente"
                            title="Visualizar"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(client.id)}
                            aria-label="Eliminar cliente"
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
                {pagination.totalPages} ({pagination.total} clientes)
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
      <ClientModal
        clientId={selectedClientId}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onUpdate={handleUpdate}
      />

      <CreateClientModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleCreated}
      />
    </>
  );
}

export default Clientes;
