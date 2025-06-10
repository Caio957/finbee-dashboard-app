
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAccounts } from "@/hooks/useAccounts";
import { useCreateTransaction } from "@/hooks/useTransactions";
import { useUpdateBillStatus } from "@/hooks/useBills";
import { Wallet, CreditCard, PiggyBank } from "lucide-react";
import { toast } from "sonner";

interface PaymentDialogProps {
  bill: {
    id: string;
    description: string;
    amount: number;
    credit_card_id?: string | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentDialog({ bill, open, onOpenChange }: PaymentDialogProps) {
  const { data: accounts = [] } = useAccounts();
  const createTransaction = useCreateTransaction();
  const updateBillStatus = useUpdateBillStatus();
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "checking": return <Wallet className="h-4 w-4" />;
      case "savings": return <PiggyBank className="h-4 w-4" />;
      case "credit": return <CreditCard className="h-4 w-4" />;
      default: return <Wallet className="h-4 w-4" />;
    }
  };

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case "checking": return "Corrente";
      case "savings": return "Poupança";
      case "credit": return "Crédito";
      default: return type;
    }
  };

  const handlePayment = async () => {
    if (!bill || !selectedAccountId) {
      toast.error("Selecione uma conta para o pagamento");
      return;
    }

    const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);
    if (!selectedAccount) {
      toast.error("Conta selecionada não encontrada");
      return;
    }

    if (selectedAccount.balance < bill.amount) {
      toast.error("Saldo insuficiente na conta selecionada");
      return;
    }

    setIsProcessing(true);

    try {
      console.log(`Processing payment for bill ${bill.id}, amount: ${bill.amount}, account: ${selectedAccountId}`);
      
      // Criar transação de débito na conta
      await createTransaction.mutateAsync({
        description: `Pagamento: ${bill.description}`,
        amount: bill.amount,
        type: "expense",
        status: "completed",
        date: new Date().toISOString().split('T')[0],
        account_id: selectedAccountId,
        category_id: null,
        credit_card_id: bill.credit_card_id || null,
        bill_id: bill.id,
      });

      // Marcar fatura como paga
      await updateBillStatus.mutateAsync({ 
        id: bill.id, 
        status: "paid" 
      });

      console.log("Payment processed successfully");
      toast.success("Pagamento realizado com sucesso!");
      onOpenChange(false);
      setSelectedAccountId("");
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      toast.error("Erro ao processar pagamento");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!bill) return null;

  // Filtrar apenas contas que não são de crédito para pagamento
  const availableAccounts = accounts.filter(account => 
    account.type !== "credit" && account.balance >= bill.amount
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
                <SelectValue placeholder="Escolha a conta para débito" />
              </SelectTrigger>
              <SelectContent>
                {availableAccounts.length === 0 ? (
                  <div className="p-2 text-center text-muted-foreground">
                    Nenhuma conta com saldo suficiente
                  </div>
                ) : (
                  availableAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center gap-2">
                        {getAccountIcon(account.type)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span>{account.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({getAccountTypeLabel(account.type)})
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Saldo: R$ {account.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedAccountId && (
            <div className="p-3 border rounded-lg bg-blue-50">
              <p className="text-sm font-medium">Resumo do Pagamento:</p>
              <div className="text-sm text-muted-foreground mt-1">
                <p>• Valor a ser debitado: R$ {bill.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <p>• Nova transação será criada no extrato</p>
                <p>• Fatura será marcada como paga</p>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={handlePayment} 
              className="flex-1" 
              disabled={!selectedAccountId || isProcessing || availableAccounts.length === 0}
            >
              {isProcessing ? "Processando..." : "Confirmar Pagamento"}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
