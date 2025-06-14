import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateCreditCard } from "@/hooks/useCreditCards";
import type { CreditCard } from "@/types";

interface ConfigureCreditCardDialogProps {
  card: CreditCard | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConfigureCreditCardDialog({ 
  card, 
  open, 
  onOpenChange 
}: ConfigureCreditCardDialogProps) {
  const updateCreditCard = useUpdateCreditCard();
  
  const [formData, setFormData] = useState({
    name: card?.name || "",
    bank: card?.bank || "",
    card_limit: card?.card_limit || "",
    due_date: card?.due_date || 10,
    closing_date: card?.closing_date || 25,
    status: card?.status || "active" as const,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!card) return;

    const submitData = {
      ...formData,
      card_limit: Number(formData.card_limit) || 0,
    };

    await updateCreditCard.mutateAsync({
      id: card.id,
      ...submitData,
    });

    onOpenChange(false);
  };

  if (!card) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurar Cartão - {card.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Cartão</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="bank">Banco</Label>
            <Input
              id="bank"
              value={formData.bank}
              onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="limit">Limite</Label>
            <Input
              id="limit"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={formData.card_limit}
              onChange={(e) => setFormData({ ...formData, card_limit: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="due_date">Dia Vencimento</Label>
              <Input
                id="due_date"
                type="number"
                min="1"
                max="31"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: Number(e.target.value) })}
                required
              />
            </div>
            <div>
              <Label htmlFor="closing_date">Dia Fechamento</Label>
              <Input
                id="closing_date"
                type="number"
                min="1"
                max="31"
                value={formData.closing_date}
                onChange={(e) => setFormData({ ...formData, closing_date: Number(e.target.value) })}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value: "active" | "blocked") => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="blocked">Bloqueado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={updateCreditCard.isPending}>
              {updateCreditCard.isPending ? "Salvando..." : "Salvar Configurações"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
