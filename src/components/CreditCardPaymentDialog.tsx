import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAccounts } from "@/hooks/useAccounts";
import { useCreateTransaction } from "@/hooks/useTransactions";
import { useUpdateCreditCard } from "@/hooks/useCreditCards";
import { Wallet, CreditCard, PiggyBank } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CreditCardPaymentDialogProps {
  card: {
    id: string;
    name: string;
    bank: string;
    used_amount: number;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreditCardPaymentDialog({ card, open, onOpenChange }: CreditCardPaymentDialogProps) {
  const { data: accounts = [] } = useAccounts();
  const createTransaction = useCreateTransaction();
  const updateCreditCard = useUpdateCreditCard();
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

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
    if (!card || !selectedAccountId) {
      toast.error("Selecione uma conta para o pagamento");
      return;
    }

    const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);
    if (!selectedAccount) {
      toast.error("Conta selecionada não encontrada");
      return;
    }

    if (selectedAccount.balance < card.used_amount) {
      toast.error("Saldo insuficiente na conta selecionada");
      return;
    }

    setIsProcessing(true);

    try {
      // Criar transação de débito na conta
      await createTransaction.mutateAsync({
        description: `Pagamento fatura ${card.name} - ${card.bank}`,
        amount: card.used_amount,
        type: "expense",
        status: "completed",
        date: new Date().toISOString().split('T')[0],
        account_id: selectedAccountId,
        category_id: null,
        credit_card_id: card.id,
      });

      // Zerar o valor usado do cartão
      await updateCreditCard.mutateAsync({
        id: card.id,
        used_amount: 0,
      });

      // Atualizar status das faturas relacionadas para 'paid'
      await supabase
        .from("bills")
        .update({ status: "paid" })
        .eq("credit_card_id", card.id)
        .eq("status", "pending");

      // Invalida a query das faturas para atualizar a tela de Faturas a Pagar
      queryClient.invalidateQueries({ queryKey: ["bills"] });

      toast.success("Fatura do cartão paga com sucesso!");
      onOpenChange(false);
      setSelectedAccountId("");
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      toast.error("Erro ao processar pagamento");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!card || card.used_amount <= 0) return null;

  // Filtrar apenas contas que não são de crédito para pagamento
  const availableAccounts = accounts.filter(account => 
    account.type !== "credit" && account.balance >= card.used_amount
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pagar Fatura do Cartão</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 border rounded-lg bg-muted/50">
            <h3 className="font-medium">{card.name} - {card.bank}</h3>
            <p className="text-2xl font-bold text-red-600">R$ {card.used_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <p className="text-sm text-muted-foreground">Valor da fatura atual</p>
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
                <p>• Valor a ser debitado: R$ {card.used_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <p>• Nova transação será criada no extrato</p>
                <p>• Fatura do cartão será zerada</p>
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
