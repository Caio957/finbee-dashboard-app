import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, CreditCard, Calendar, DollarSign, Trash2 } from "lucide-react";
import { useCreditCards, useCreateCreditCard, useDeleteCreditCard } from "@/hooks/useCreditCards";
import { useAccounts } from "@/hooks/useAccounts";
import { useTransactions } from "@/hooks/useTransactions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCardInvoiceDialog } from "@/components/CreditCardInvoiceDialog";

export default function CreditCards() {
  const { data: creditCards = [], isLoading } = useCreditCards();
  const { data: accounts = [] } = useAccounts();
  const { data: transactions = [] } = useTransactions();
  const createCreditCard = useCreateCreditCard();
  const deleteCreditCard = useDeleteCreditCard();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bank: "",
    card_limit: 0,
    due_date: 10,
    closing_date: 25,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCreditCard.mutateAsync({
      ...formData,
      used_amount: 0,
      status: "active" as const,
    });
    setIsDialogOpen(false);
    setFormData({
      name: "",
      bank: "",
      card_limit: 0,
      due_date: 10,
      closing_date: 25,
    });
  };

  const handleDeleteCard = async (cardId: string, usedAmount: number) => {
    if (usedAmount > 0) {
      toast.error("Não é possível excluir cartão com fatura pendente");
      return;
    }
    await deleteCreditCard.mutateAsync(cardId);
  };

  const totalLimit = creditCards.reduce((sum, card) => sum + card.card_limit, 0);
  const totalUsed = creditCards.reduce((sum, card) => sum + card.used_amount, 0);
  const totalAvailable = totalLimit - totalUsed;

  // Transações de cartão dos últimos dias
  const recentCardTransactions = transactions
    .filter(t => t.type === "expense" && !t.account_id)
    .slice(0, 4)
    .map(t => ({
      description: t.description,
      amount: t.amount,
      date: new Date(t.date).toLocaleDateString('pt-BR'),
      card: "Cartão"
    }));

  if (isLoading) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Cartão de Crédito</h1>
          <p className="text-muted-foreground">Gerencie seus cartões e faturas</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Cartão
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Cartão</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Cartão</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Nubank Roxinho"
                  required
                />
              </div>
              <div>
                <Label htmlFor="bank">Banco</Label>
                <Select value={formData.bank} onValueChange={(value) => setFormData({ ...formData, bank: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um banco" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.length > 0 && accounts.map(account => (
                      <SelectItem key={account.id} value={account.bank}>
                        {account.bank}
                      </SelectItem>
                    ))}
                    <SelectItem value="Nubank">Nubank</SelectItem>
                    <SelectItem value="Itaú">Itaú</SelectItem>
                    <SelectItem value="Bradesco">Bradesco</SelectItem>
                    <SelectItem value="Santander">Santander</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="limit">Limite</Label>
                <Input
                  id="limit"
                  type="number"
                  value={formData.card_limit}
                  onChange={(e) => setFormData({ ...formData, card_limit: Number(e.target.value) })}
                  placeholder="5000"
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
              <Button type="submit" className="w-full" disabled={createCreditCard.isPending}>
                {createCreditCard.isPending ? "Adicionando..." : "Adicionar Cartão"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Resumo Geral */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Limite Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalLimit.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">Todos os cartões</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fatura Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">R$ {totalUsed.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">
              {totalLimit > 0 ? ((totalUsed / totalLimit) * 100).toFixed(1) : 0}% do limite
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Disponível</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ {totalAvailable.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">
              {totalLimit > 0 ? ((totalAvailable / totalLimit) * 100).toFixed(1) : 0}% do limite
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Cartões */}
      <div className="grid gap-4 md:grid-cols-2">
        {creditCards.length === 0 ? (
          <Card className="col-span-2">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum cartão cadastrado</p>
              <p className="text-sm text-muted-foreground">Clique em "Novo Cartão" para começar</p>
            </CardContent>
          </Card>
        ) : (
          creditCards.map((card) => {
            const usagePercentage = (card.used_amount / card.card_limit) * 100;
            const available = card.card_limit - card.used_amount;
            
            return (
              <Card key={card.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    <CardTitle className="text-lg">{card.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={card.status === "active" ? "default" : "destructive"}>
                      {card.status === "active" ? "Ativo" : "Bloqueado"}
                    </Badge>
                    {card.used_amount === 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCard(card.id, card.used_amount)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{card.bank}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Limite usado</span>
                      <span>R$ {card.used_amount.toLocaleString('pt-BR')} de R$ {card.card_limit.toLocaleString('pt-BR')}</span>
                    </div>
                    <Progress value={usagePercentage} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Disponível: R$ {available.toLocaleString('pt-BR')} ({(100 - usagePercentage).toFixed(1)}%)
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Fechamento
                      </p>
                      <p className="font-medium">Dia {card.closing_date}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        Vencimento
                      </p>
                      <p className="font-medium">Dia {card.due_date}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        setSelectedCard(card);
                        setIsInvoiceDialogOpen(true);
                      }}
                    >
                      Ver Fatura
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Configurar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Últimas Transações */}
      <Card>
        <CardHeader>
          <CardTitle>Últimas Transações do Cartão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentCardTransactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Nenhuma transação encontrada</p>
            ) : (
              recentCardTransactions.map((transaction, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">{transaction.card} • {transaction.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600">R$ {transaction.amount.toLocaleString('pt-BR')}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <CreditCardInvoiceDialog
        card={selectedCard}
        open={isInvoiceDialogOpen}
        onOpenChange={setIsInvoiceDialogOpen}
      />
    </div>
  );
}
