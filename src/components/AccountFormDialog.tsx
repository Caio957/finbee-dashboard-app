// src/components/AccountFormDialog.tsx

import { useState, useEffect } from "react";
import type { Account } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AccountFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (formData: Omit<Account, "id" | "created_at" | "user_id" | "balance">) => void;
  account: Account | null; // Recebe a conta para edição ou null para criação
}

export function AccountFormDialog({ open, onOpenChange, onSave, account }: AccountFormDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "checking" as "checking" | "savings",
    bank: "", // Supondo que você tenha um campo 'bank'
  });

  // Efeito para preencher o formulário quando uma conta é selecionada para edição
  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name,
        type: account.type as "checking" | "savings",
        bank: (account as any).bank || "", // O 'any' aqui é um ajuste caso 'bank' não esteja no tipo Account
      });
    } else {
      // Reseta o formulário para o estado inicial quando for criar uma nova conta
      setFormData({
        name: "",
        type: "checking",
        bank: "",
      });
    }
  }, [account, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{account ? "Editar Conta" : "Adicionar Nova Conta"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome da Conta</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Carteira, NuConta"
              required
            />
          </div>
          <div>
            <Label htmlFor="type">Tipo de Conta</Label>
            <Select
              value={formData.type}
              onValueChange={(value: "checking" | "savings") => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checking">Conta Corrente</SelectItem>
                <SelectItem value="savings">Poupança</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="bank">Instituição/Banco (Opcional)</Label>
            <Input
              id="bank"
              value={formData.bank}
              onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
              placeholder="Ex: Itaú, NuBank"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}