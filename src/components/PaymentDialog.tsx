// src/components/PaymentDialog.tsx (VERSÃO CORRIGIDA)

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAccounts } from "@/hooks/useAccounts";
import { useCreateTransaction } from "@/hooks/useTransactions";
// CORREÇÃO 1: Importar 'useUpdateBill' no lugar do antigo 'useUpdateBillStatus'
import { useUpdateBill } from "@/hooks/useBills";
import { Wallet, PiggyBank } from "lucide-react";
import { toast } from "sonner";
import type { Bill, Account} from "@/types";
import type { Transaction } from "@/types"; // Garanta que o tipo Transaction está sendo importado

interface PaymentDialogProps {
  bill: Bill | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentDialog({ bill, open, onOpenChange }: PaymentDialogProps) {
  const { data: accounts = [] } = useAccounts();
  const createTransaction = useCreateTransaction();
  // CORREÇÃO 2: Usar o hook correto
  const updateBill = useUpdateBill();
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");

  const handlePayment = async () => {
    if (!bill || !selectedAccountId) {
      toast.error("Selecione uma conta para o pagamento");
      return;
    }

    try {
      // 1. Criar a transação de pagamento, agora vinculada com bill_id
      await createTransaction.mutateAsync({
        description: `Pagamento: ${bill.description}`,
        amount: bill.amount,
        type: "expense",
        status: "completed",
        date: new Date().toISOString().split('T')[0],
        account_id: selectedAccountId,
        bill_id: bill.id, // Vínculo importante para o estorno
      });

      // 2. Atualizar o status da fatura para 'paga'
      await updateBill.mutateAsync({ 
        id: bill.id, 
        status: "paid" 
      });

      toast.success("Pagamento realizado com sucesso!");
      onOpenChange(false);
      setSelectedAccountId("");
    } catch (error: any) {
      console.error("Erro ao processar pagamento:", error);
      toast.error(error.message || "Erro ao processar pagamento");
    }
  };

  if (!bill) return null;

  const getAccountIcon = (type: string) => {
    return type === 'savings' ? <PiggyBank className="h-4 w-4" /> : <Wallet className="h-4 w-4" />;
  };

  const availableAccounts = accounts.filter(
    (account) => account.balance >= bill.amount
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pagar Fatura</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 border rounded-lg bg-muted/50">
            <h3 className="font-medium">{bill.description}</h3>
            <p className="text-2xl font-bold text-red-600">R$ {bill.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div>
            <Label htmlFor="account">Selecionar Conta para Débito</Label>
            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha uma conta" />
              </SelectTrigger>
              <SelectContent>
                {availableAccounts.length > 0 ? (
                  availableAccounts.map((account: Account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center gap-2">
                        {getAccountIcon(account.type)}
                        <span>{account.name} (Saldo: R$ {account.balance.toLocaleString('pt-BR')})</span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-center text-sm text-muted-foreground">
                    Nenhuma conta com saldo suficiente.
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button
              onClick={handlePayment}
              disabled={!selectedAccountId || createTransaction.isPending || updateBill.isPending}
            >
              {createTransaction.isPending || updateBill.isPending ? "Processando..." : "Confirmar Pagamento"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
//a