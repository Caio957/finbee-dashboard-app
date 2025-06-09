
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, DollarSign, CalendarDays, Building2 } from "lucide-react";
import { useSalaries, useDeleteSalary, type Salary } from "@/hooks/useSalaries";
import { SalaryConfigDialog } from "@/components/SalaryConfigDialog";

export default function SalaryPage() {
  const { data: salaries = [], isLoading } = useSalaries();
  const deleteSalary = useDeleteSalary();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState<Salary | null>(null);

  const handleEdit = (salary: Salary) => {
    setSelectedSalary(salary);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este salário?")) {
      await deleteSalary.mutateAsync(id);
    }
  };

  const handleNewSalary = () => {
    setSelectedSalary(null);
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Configuração de Salário</h1>
          <p className="text-muted-foreground">
            Configure seus salários para crédito automático
          </p>
        </div>
        <Button onClick={handleNewSalary} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Salário
        </Button>
      </div>

      {salaries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum salário configurado</h3>
            <p className="text-muted-foreground text-center mb-4">
              Configure seu salário para automatizar o crédito em sua conta
            </p>
            <Button onClick={handleNewSalary}>
              Configurar Primeiro Salário
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {salaries.map((salary) => (
            <Card key={salary.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{salary.description}</CardTitle>
                  <Badge variant={salary.is_active ? "default" : "secondary"}>
                    {salary.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span>Bruto: R$ {salary.gross_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span>Líquido: R$ {salary.net_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    <span>Dia {salary.payment_day} do mês</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span>Conta vinculada</span>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(salary)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(salary.id)}
                    disabled={deleteSalary.isPending}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SalaryConfigDialog
        salary={selectedSalary}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
