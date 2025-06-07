
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { useTransactions, useCreateTransaction } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { type CreditCard } from "@/hooks/useCreditCards";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CreditCardInvoiceDialogProps {
  card: CreditCard | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreditCardInvoiceDialog({ card, open, onOpenChange }: CreditCardInvoiceDialogProps) {
  const { data: transactions = [] } = useTransactions();
  const { data: categories = [] } = useCategories();
  const createTransaction = useCreateTransaction();
  
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    description: "",
    amount: 0,
    category_id: "",
    date: new Date().toISOString().split('T')[0],
  });

  // Filtra transações do cartão (assumindo que sejam gastos sem account_id específico)
  const cardTransactions = transactions.filter(t => 
    t.type === "expense" && !t.account_id
  ).slice(0, 10);

  const expenseCategories = categories.filter(cat => cat.type === "expense");

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!card) return;

    await createTransaction.mutateAsync({
      ...newTransaction,
      type: "expense",
      status: "completed",
      account_id: null,
      category_id: newTransaction.category_id || null,
      credit_card_id: card.id,
    });

    setNewTransaction({
      description: "",
      amount: 0,
      category_id: "",
      date: new Date().toISOString().split('T')[0],
    });
    setShowAddTransaction(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Fatura - {card?.name} ({card?.bank})
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Fatura Atual</p>
            <p className="text-2xl font-bold text-red-600">
              R$ {Number(card?.used_amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-muted-foreground">
              Vencimento: Dia {card?.due_date} | Fechamento: Dia {card?.closing_date}
            </p>
          </div>
          
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Transações</h3>
            <Button 
              size="sm" 
              onClick={() => setShowAddTransaction(!showAddTransaction)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar Gasto
            </Button>
          </div>

          {showAddTransaction && (
            <form onSubmit={handleAddTransaction} className="p-4 border rounded-lg space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                    placeholder="Descrição do gasto"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Valor</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({ ...newTransaction, amount: Number(e.target.value) })}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={newTransaction.category_id} onValueChange={(value) => setNewTransaction({ ...newTransaction, category_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={createTransaction.isPending}>
                  {createTransaction.isPending ? "Adicionando..." : "Adicionar"}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddTransaction(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          )}
          
          <div className="space-y-3">
            {cardTransactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma transação encontrada para este cartão.
              </p>
            ) : (
              cardTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{transaction.description}</p>
                      <Badge variant={transaction.status === "completed" ? "default" : "secondary"}>
                        {transaction.status === "completed" ? "Realizado" : "Pendente"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-lg font-semibold text-red-600">
                    R$ {Number(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
