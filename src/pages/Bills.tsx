import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Calendar, CheckCircle, Edit, Trash2, Undo2, CreditCard, Sparkles} from "lucide-react";
// ALTERAÇÃO 1: Importar o novo hook
import { useBills, useCreateBill, useUpdateBillStatus, useDeleteBill, useRevertBillPayment } from "@/hooks/useBills";
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
  const updateBillStatus = useUpdateBillStatus(); // Pode ser removido se não for mais usado
  const deleteBill = useDeleteBill();
  const createTransaction = useCreateTransaction();
  const billCleanup = useBillCleanup();
  // ALTERAÇÃO 2: Inicializar o novo hook
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
    is_credit_card: false,
    credit_card_id: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createBill.mutateAsync({
      ...formData,
      status: "pending" as const,
    });

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

  const handleMarkAsPaid = async (bill: any) => {
    setPaymentBill(bill);
    setIsPaymentDialogOpen(true);
  };

  // ALTERAÇÃO 3: Usar a nova lógica de estorno
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
      {/* ...código do cabeçalho e resumo... */}
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
                {/* ... conteúdo do formulário ... */}
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* ... Resumo e Filtros ... */}

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
                  {/* ...informações da fatura... */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                        {/* ... */}
                    </div>
                    <div className="flex gap-2">
                      {/* ...outros botões... */}
                      {bill.status === "paid" && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex items-center gap-1"
                          onClick={() => handleRevertToPending(bill.id)}
                          // ALTERAÇÃO 4: Usar o estado de 'pending' do novo hook
                          disabled={revertBillPayment.isPending} 
                        >
                          <Undo2 className="h-4 w-4" />
                          {revertBillPayment.isPending ? "Estornando..." : "Estornar"}
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

      <PaymentDialog
        bill={paymentBill}
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
      />
    </div>
  );
}