
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";
import { useInvestments, useCreateInvestment } from "@/hooks/useInvestments";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Investments() {
  const { data: investments = [], isLoading } = useInvestments();
  const createInvestment = useCreateInvestment();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "fixed" as "stock" | "fund" | "crypto" | "fixed",
    invested_amount: 0,
    current_value: 0,
    quantity: null as number | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createInvestment.mutateAsync(formData);
    setIsDialogOpen(false);
    setFormData({
      name: "",
      type: "fixed",
      invested_amount: 0,
      current_value: 0,
      quantity: null,
    });
  };

  const totalInvested = investments.reduce((sum, inv) => sum + inv.invested_amount, 0);
  const totalCurrent = investments.reduce((sum, inv) => sum + inv.current_value, 0);
  const totalProfitLoss = totalCurrent - totalInvested;
  const totalPercentage = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "stock": return "Ação";
      case "fund": return "Fundo";
      case "crypto": return "Crypto";
      case "fixed": return "Renda Fixa";
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "stock": return "bg-blue-100 text-blue-800";
      case "fund": return "bg-green-100 text-green-800";
      case "crypto": return "bg-orange-100 text-orange-800";
      case "fixed": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Investimentos</h1>
          <p className="text-muted-foreground">Acompanhe sua carteira de investimentos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Investimento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Investimento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: ITSA4"
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stock">Ação</SelectItem>
                    <SelectItem value="fund">Fundo</SelectItem>
                    <SelectItem value="crypto">Criptomoeda</SelectItem>
                    <SelectItem value="fixed">Renda Fixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="invested_amount">Valor Investido</Label>
                <Input
                  id="invested_amount"
                  type="number"
                  step="0.01"
                  value={formData.invested_amount}
                  onChange={(e) => setFormData({ ...formData, invested_amount: Number(e.target.value) })}
                  placeholder="5000.00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="current_value">Valor Atual</Label>
                <Input
                  id="current_value"
                  type="number"
                  step="0.01"
                  value={formData.current_value}
                  onChange={(e) => setFormData({ ...formData, current_value: Number(e.target.value) })}
                  placeholder="5350.00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="quantity">Quantidade (opcional)</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.0001"
                  value={formData.quantity || ""}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value ? Number(e.target.value) : null })}
                  placeholder="100"
                />
              </div>
              <Button type="submit" className="w-full" disabled={createInvestment.isPending}>
                {createInvestment.isPending ? "Adicionando..." : "Adicionar Investimento"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Resumo da Carteira */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Investido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalInvested.toLocaleString('pt-BR')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valor Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalCurrent.toLocaleString('pt-BR')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Resultado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalProfitLoss >= 0 ? '+' : ''}R$ {totalProfitLoss.toLocaleString('pt-BR')}
            </div>
            <p className={`text-xs ${totalPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalPercentage >= 0 ? '+' : ''}{totalPercentage.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Diversificação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{investments.length}</div>
            <p className="text-xs text-muted-foreground">investimentos</p>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por Tipo */}
      {investments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribuição da Carteira
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["fixed", "fund", "stock", "crypto"].map(type => {
                const typeInvestments = investments.filter(inv => inv.type === type);
                const typeTotal = typeInvestments.reduce((sum, inv) => sum + inv.current_value, 0);
                const typePercentage = totalCurrent > 0 ? (typeTotal / totalCurrent) * 100 : 0;
                
                return typeTotal > 0 ? (
                  <div key={type} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{getTypeLabel(type)}</span>
                      <span className="text-sm">R$ {typeTotal.toLocaleString('pt-BR')} ({typePercentage.toFixed(1)}%)</span>
                    </div>
                    <Progress value={typePercentage} className="h-2" />
                  </div>
                ) : null;
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Investimentos */}
      <Card>
        <CardHeader>
          <CardTitle>Meus Investimentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {investments.length === 0 ? (
              <div className="text-center py-8">
                <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum investimento cadastrado</p>
                <p className="text-sm text-muted-foreground">Clique em "Novo Investimento" para começar</p>
              </div>
            ) : (
              investments.map((investment) => {
                const profitLoss = investment.current_value - investment.invested_amount;
                const percentage = investment.invested_amount > 0 ? (profitLoss / investment.invested_amount) * 100 : 0;
                
                return (
                  <div key={investment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                        {profitLoss >= 0 ? 
                          <TrendingUp className="h-5 w-5 text-green-600" /> : 
                          <TrendingDown className="h-5 w-5 text-red-600" />
                        }
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{investment.name}</p>
                          <Badge className={getTypeColor(investment.type)}>
                            {getTypeLabel(investment.type)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Investido: R$ {investment.invested_amount.toLocaleString('pt-BR')}</span>
                          {investment.quantity && <span>• {investment.quantity} cotas</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        R$ {investment.current_value.toLocaleString('pt-BR')}
                      </div>
                      <div className={`text-sm ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {profitLoss >= 0 ? '+' : ''}R$ {profitLoss.toLocaleString('pt-BR')} 
                        ({percentage >= 0 ? '+' : ''}{percentage.toFixed(2)}%)
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Aplicar Dinheiro
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Resgatar
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Rebalancear
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Aporte
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
