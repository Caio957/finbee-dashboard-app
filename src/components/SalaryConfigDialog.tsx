
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCreateSalary, useUpdateSalary, type Salary } from "@/hooks/useSalaries";
import { useAccounts } from "@/hooks/useAccounts";

interface SalaryConfigDialogProps {
  salary?: Salary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SalaryConfigDialog({ 
  salary, 
  open, 
  onOpenChange 
}: SalaryConfigDialogProps) {
  const { data: accounts = [] } = useAccounts();
  const createSalary = useCreateSalary();
  const updateSalary = useUpdateSalary();
  
  const [formData, setFormData] = useState({
    description: salary?.description || "Salário",
    gross_amount: salary?.gross_amount || "",
    net_amount: salary?.net_amount || "",
    account_id: salary?.account_id || "",
    payment_day: salary?.payment_day || 5,
    is_active: salary?.is_active ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      gross_amount: Number(formData.gross_amount) || 0,
      net_amount: Number(formData.net_amount) || 0,
    };

    if (salary) {
      await updateSalary.mutateAsync({
        id: salary.id,
        ...submitData,
      });
    } else {
      await createSalary.mutateAsync(submitData);
    }

    onOpenChange(false);
    setFormData({
      description: "Salário",
      gross_amount: "",
      net_amount: "",
      account_id: "",
      payment_day: 5,
      is_active: true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {salary ? "Editar Salário" : "Configurar Salário"}
          </DialogTitle>
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
            <Label htmlFor="gross_amount">Salário Bruto (R$)</Label>
            <Input
              id="gross_amount"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={formData.gross_amount}
              onChange={(e) => setFormData({ ...formData, gross_amount: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="net_amount">Salário Líquido (R$)</Label>
            <Input
              id="net_amount"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={formData.net_amount}
              onChange={(e) => setFormData({ ...formData, net_amount: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="account">Conta para Crédito</Label>
            <Select 
              value={formData.account_id} 
              onValueChange={(value) => setFormData({ ...formData, account_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma conta" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} - {account.bank}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="payment_day">Dia do Pagamento</Label>
            <Input
              id="payment_day"
              type="number"
              min="1"
              max="31"
              value={formData.payment_day}
              onChange={(e) => setFormData({ ...formData, payment_day: Number(e.target.value) })}
              required
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Ativo</Label>
          </div>
          
          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={createSalary.isPending || updateSalary.isPending}
            >
              {createSalary.isPending || updateSalary.isPending ? "Salvando..." : "Salvar"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
