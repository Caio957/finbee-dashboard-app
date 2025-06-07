
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Calendar, CheckCircle, Edit, Trash2, Undo2, CreditCard } from "lucide-react";
import { useBills, useCreateBill, useUpdateBillStatus, useDeleteBill } from "@/hooks/useBills";
import { useCreateTransaction } from "@/hooks/useTransactions";
import { useCreditCards } from "@/hooks/useCreditCards";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { EditBillDialog } from "@/components/EditBillDialog";
import { toast } from "sonner";

export default function Bills() {
  const { data: bills = [], isLoading } = useBills();
  const { data: creditCards = [] } = useCreditCards();
  const createBill = useCreateBill();
  const updateBillStatus = useUpdateBillStatus();
  const deleteBill = useDeleteBill();
  const createTransaction = useCreateTransaction();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "paid" | "overdue">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editBill, setEditBill] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    amount: 0,
    due_date: "",
    category: "Outros",
    recurring: false,
    is_credit_card: false,
    credit_card_id: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createBill.mutateAsync({
      ...formData,
      status: "pending" as const,
    });

    // Se for fatura de cartão de crédito, criar transação
    if (formData.is_credit_card && formData.credit_card_id) {
      await createTransaction.mutateAsync({
        description: formData.description,
        amount: formData.amount,
        type: "expense",
        status: "pending",
        date: new Date().toISOString().split('T')[0],
        account_id: null,
        category_id: null,
        credit_card_id: formData.credit_card_id,
      });
    }

    setIsDialogOpen(false);
    setFormData({
      description: "",
      amount: 0,
      due_date: "",
      category: "Outros",
      recurring: false,
      is_credit_card: false,
      credit_card_id: "",
    });
  };

  const handleMarkAsPaid = async (id: string) => {
    await updateBillStatus.mutateAsync({ id, status: "paid" });
  };

  const handleRevertToPending = async (id: string) => {
    await updateBillStatus.mutateAsync({ id, status: "pending" });
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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Fatura
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Fatura</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex: Aluguel"
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
                  placeholder="1200.00"
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
                    <SelectItem value="Moradia">Moradia</SelectItem>
                    <SelectItem value="Utilities">Utilities</SelectItem>
                    <SelectItem value="Transporte">Transporte</SelectItem>
                    <SelectItem value="Saúde">Saúde</SelectItem>
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
                <Label htmlFor="recurring">Recorrente</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_credit_card"
                  checked={formData.is_credit_card}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_credit_card: checked, credit_card_id: "" })}
                />
                <Label htmlFor="is_credit_card">Fatura de Cartão de Crédito</Label>
              </div>
              {formData.is_credit_card && (
                <div>
                  <Label htmlFor="credit_card_id">Cartão de Crédito</Label>
                  <Select value={formData.credit_card_id} onValueChange={(value) => setFormData({ ...formData, credit_card_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cartão" />
                    </SelectTrigger>
                    <SelectContent>
                      {creditCards.map((card) => (
                        <SelectItem key={card.id} value={card.id}>
                          {card.name} - {card.bank}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={createBill.isPending}>
                {createBill.isPending ? "Adicionando..." : "Adicionar Fatura"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Pendente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">R$ {totalPending.toLocaleString('pt-BR')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Em Atraso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">R$ {totalOverdue.toLocaleString('pt-BR')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pagas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ {totalPaid.toLocaleString('pt-BR')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Faturas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bills.length}</div>
            <p className="text-xs text-muted-foreground">cadastradas</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar faturas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant={statusFilter === "all" ? "default" : "outline"}
                onClick={() => setStatusFilter("all")}
              >
                Todas
              </Button>
              <Button 
                variant={statusFilter === "pending" ? "default" : "outline"}
                onClick={() => setStatusFilter("pending")}
              >
                Pendentes
              </Button>
              <Button 
                variant={statusFilter === "paid" ? "default" : "outline"}
                onClick={() => setStatusFilter("paid")}
              >
                Pagas
              </Button>
              <Button 
                variant={statusFilter === "overdue" ? "default" : "outline"}
                onClick={() => setStatusFilter("overdue")}
              >
                Vencidas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Faturas */}
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
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{bill.description}</p>
                        {bill.recurring && <Badge variant="outline" className="text-xs">Recorrente</Badge>}
                        {bill.credit_card_id && <CreditCard className="h-4 w-4 text-blue-600" />}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{bill.category}</span>
                        <span>•</span>
                        <span>Vence em {new Date(bill.due_date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        R$ {bill.amount.toLocaleString('pt-BR')}
                      </div>
                      {getStatusBadge(bill.status)}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditBill(bill)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteBill(bill.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {bill.status === "pending" && (
                        <Button 
                          size="sm" 
                          className="flex items-center gap-1"
                          onClick={() => handleMarkAsPaid(bill.id)}
                          disabled={updateBillStatus.isPending}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Pagar
                        </Button>
                      )}
                      {bill.status === "paid" && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex items-center gap-1"
                          onClick={() => handleRevertToPending(bill.id)}
                          disabled={updateBillStatus.isPending}
                        >
                          <Undo2 className="h-4 w-4" />
                          Estornar
                        </Button>
                      )}
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
    </div>
  );
}
