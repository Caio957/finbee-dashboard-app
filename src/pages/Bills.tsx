import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Calendar, CheckCircle, Edit, Trash2, Undo2, CreditCard, Sparkles} from "lucide-react";
import { useBills, useCreateBill, useDeleteBill, useRevertBillPayment } from "@/hooks/useBills";
import { useCreateTransaction } from "@/hooks/useTransactions";
import { useCreditCards } from "@/hooks/useCreditCards";
import { useBillCleanup } from "@/hooks/useBillCleanup";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { EditBillDialog } from "@/components/EditBillDialog";
import { PaymentDialog } from "@/components/PaymentDialog";
import { toast } from "sonner";

export default function Bills() {
  const { data: bills = [], isLoading } = useBills();
  const { data: creditCards = [] } = useCreditCards();
  const createBill = useCreateBill();
  const deleteBill = useDeleteBill();
  const createTransaction = useCreateTransaction();
  const billCleanup = useBillCleanup();
  const revertBillPayment = useRevertBillPayment();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "paid" | "overdue">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editBill, setEditBill] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [paymentBill, setPaymentBill] = useState<any>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    amount: 0,
    due_date: "",
    category: "Outros",
    recurring: false,
    credit_card_id: "none-selected",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const billData = {
      ...formData,
      status: "pending" as const,
      credit_card_id: formData.credit_card_id === "" || formData.credit_card_id === "none-selected" ? null : formData.credit_card_id,
    };

    await createBill.mutateAsync(billData);

    if (billData.credit_card_id) {
      await createTransaction.mutateAsync({
        description: formData.description,
        amount: formData.amount,
        type: "expense",
        status: "completed",
        date: new Date().toISOString().split('T')[0],
        account_id: null,
        category_id: null,
        credit_card_id: billData.credit_card_id,
      });
    }

    setIsDialogOpen(false);
    setFormData({
      description: "",
      amount: 0,
      due_date: "",
      category: "Outros",
      recurring: false,
      credit_card_id: "none-selected",
    });
  };

  const handleMarkAsPaid = async (bill: any) => {
    setPaymentBill(bill);
    setIsPaymentDialogOpen(true);
  };

  const handleRevertToPending = async (id: string) => {
    await revertBillPayment.mutateAsync(id);
  };

  const handleDeleteBill = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta fatura?")) {
      await deleteBill.mutateAsync(id);
    }
  };

  const handleEditBill = (bill: any) => {
    setEditBill(bill);
    setIsEditDialogOpen(true);
  };

  const handleCleanupDuplicates = async () => {
    await billCleanup.mutateAsync();
  };

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || bill.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Pago</Badge>;
      case "overdue":
        return <Badge variant="destructive">Vencido</Badge>;
      default:
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  const totalPending = bills.filter(bill => bill.status === "pending").reduce((sum, bill) => sum + bill.amount, 0);
  const totalOverdue = bills.filter(bill => bill.status === "overdue").reduce((sum, bill) => sum + bill.amount, 0);
  const totalPaid = bills.filter(bill => bill.status === "paid").reduce((sum, bill) => sum + bill.amount, 0);

  if (isLoading) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Faturas a Pagar</h1>
          <p className="text-muted-foreground">Gerencie suas contas e compromissos</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={handleCleanupDuplicates}
            disabled={billCleanup.isPending}
            className="flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {billCleanup.isPending ? "Limpando..." : "Limpar Duplicatas"}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nova Fatura
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Fatura</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Valor</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="due_date">Data de Vencimento</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Alimentação">Alimentação</SelectItem>
                      <SelectItem value="Transporte">Transporte</SelectItem>
                      <SelectItem value="Saúde">Saúde</SelectItem>
                      <SelectItem value="Educação">Educação</SelectItem>
                      <SelectItem value="Lazer">Lazer</SelectItem>
                      <SelectItem value="Casa">Casa</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="recurring"
                    checked={formData.recurring}
                    onCheckedChange={(checked) => setFormData({ ...formData, recurring: checked })}
                  />
                  <Label htmlFor="recurring">Fatura recorrente</Label>
                </div>
                <div>
                  <Label htmlFor="credit_card_id">Cartão de Crédito (Opcional)</Label>
                  <Select value={formData.credit_card_id} onValueChange={(value) => setFormData({ ...formData, credit_card_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cartão (Opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none-selected">Nenhum (Não é compra no cartão)</SelectItem>
                      {creditCards.map((card) => (
                        <SelectItem key={card.id} value={card.id}>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            {card.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createBill.isPending}>
                    {createBill.isPending ? "Criando..." : "Criar Fatura"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              R$ {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {totalOverdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar faturas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="paid">Pagas</SelectItem>
            <SelectItem value="overdue">Vencidas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todas as Faturas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredBills.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {bills.length === 0 ? "Nenhuma fatura cadastrada" : "Nenhuma fatura encontrada com os filtros atuais"}
              </p>
            ) : (
              filteredBills.map((bill) => (
                <div key={bill.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-medium">{bill.description}</h3>
                      <p className="text-sm text-muted-foreground">
                        Vencimento: {new Date(bill.due_date).toLocaleDateString('pt-BR')} • {bill.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-lg">R$ {bill.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      {getStatusBadge(bill.status)}
                    </div>
                    <div className="flex gap-2">
                      {bill.status === "pending" && (
                        <Button size="sm" onClick={() => handleMarkAsPaid(bill)}>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      {bill.status === "paid" && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex items-center gap-1"
                          onClick={() => handleRevertToPending(bill.id)}
                          disabled={revertBillPayment.isPending} 
                        >
                          <Undo2 className="h-4 w-4" />
                          {revertBillPayment.isPending ? "Estornando..." : "Estornar"}
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => handleEditBill(bill)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteBill(bill.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <EditBillDialog
        bill={editBill}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />

      <PaymentDialog
        bill={paymentBill}
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
      />
    </div>
  );
}
