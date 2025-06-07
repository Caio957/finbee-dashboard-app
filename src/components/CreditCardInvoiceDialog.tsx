
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useTransactions } from "@/hooks/useTransactions";
import { type CreditCard } from "@/hooks/useCreditCards";

interface CreditCardInvoiceDialogProps {
  card: CreditCard | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreditCardInvoiceDialog({ card, open, onOpenChange }: CreditCardInvoiceDialogProps) {
  const { data: transactions = [] } = useTransactions();

  // Filtra transações do cartão (assumindo que sejam gastos sem account_id específico)
  const cardTransactions = transactions.filter(t => 
    t.type === "expense" && !t.account_id
  ).slice(0, 10);

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
          
          <div className="space-y-3">
            <h3 className="font-semibold">Últimas Transações</h3>
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
