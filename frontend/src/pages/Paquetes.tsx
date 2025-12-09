import { useState, useEffect } from "react";
import type { Package } from "@/types/package";
import { packageService } from "@/services/package.service";
import PackageModal from "@/components/PackageModal";
import CreatePackageModal from "@/components/CreatePackageModal";
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

function Paquetes() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    null
  );
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

  const loadPackages = async () => {
    setIsLoading(true);
    try {
      const response = await packageService.getAll({
        page,
        limit,
        name: name || undefined,
        orderBy,
      });
      setPackages(response.data.packages);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error loading packages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, [page, name, orderBy]);

  const handleView = (packageId: string) => {
    setSelectedPackageId(packageId);
    setIsModalOpen(true);
  };

  const handleDelete = async (packageId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este paquete?")) {
      return;
    }

    try {
      await packageService.delete(packageId);
      loadPackages();
    } catch (error) {
      console.error("Error deleting package:", error);
      alert("Error al eliminar el paquete");
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPackageId(null);
  };

  const handleUpdate = () => {
    loadPackages();
  };

  const handleCreated = () => {
    loadPackages();
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Paquetes</h1>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Crear Paquete
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
          <p className="text-center py-8">Cargando paquetes...</p>
        ) : packages.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            No se encontraron paquetes
          </p>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Precio Sugerido</TableHead>
                    <TableHead>Fecha de Creación</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packages.map((pkg) => (
                    <TableRow key={pkg.id}>
                      <TableCell className="font-medium">{pkg.name}</TableCell>
                      <TableCell>
                        {formatCurrency(pkg.suggestedPrice)}
                      </TableCell>
                      <TableCell>{formatDate(pkg.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(pkg.id)}
                            aria-label="Visualizar paquete"
                            title="Visualizar"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(pkg.id)}
                            aria-label="Eliminar paquete"
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
                {pagination.totalPages} ({pagination.total} paquetes)
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
      <PackageModal
        packageId={selectedPackageId}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onUpdate={handleUpdate}
      />

      <CreatePackageModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleCreated}
      />
    </>
  );
}

export default Paquetes;
