import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { paymentService } from "@/services/payment.service";
import type { DailySales } from "@/types/dailySales";
import DailySalesTicketModal from "./DailySalesTicketModal";

interface DailySalesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function DailySalesModal({ isOpen, onClose }: DailySalesModalProps) {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [dailySales, setDailySales] = useState<DailySales | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!selectedDate) {
      setError("Por favor selecciona una fecha");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await paymentService.getDailySales(selectedDate);
      setDailySales(response.data);
      setIsTicketModalOpen(true);
    } catch (err) {
      console.error("Error loading daily sales:", err);
      setError("Error al cargar las ventas del día");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setDailySales(null);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Imprimir Ventas</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">Seleccionar Fecha</Label>
              <Input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button onClick={handleGenerate} disabled={isLoading}>
                {isLoading ? "Cargando..." : "Generar Ticket"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {dailySales && (
        <DailySalesTicketModal
          dailySales={dailySales}
          isOpen={isTicketModalOpen}
          onClose={() => {
            setIsTicketModalOpen(false);
            setDailySales(null);
          }}
        />
      )}
    </>
  );
}

export default DailySalesModal;
