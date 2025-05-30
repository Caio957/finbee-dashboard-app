
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";

interface Investment {
  id: string;
  name: string;
  type: "stock" | "fund" | "crypto" | "fixed";
  invested: number;
  currentValue: number;
  profitLoss: number;
  percentage: number;
  quantity?: number;
}

const investments: Investment[] = [
  {
    id: "1",
    name: "Tesouro Direto IPCA+",
    type: "fixed",
    invested: 10000,
    currentValue: 10450,
    profitLoss: 450,
    percentage: 4.5
  },
  {
    id: "2",
    name: "ITSA4",
    type: "stock",
    invested: 5000,
    currentValue: 5350,
    profitLoss: 350,
    percentage: 7.0,
    quantity: 500
  },
  {
    id: "3",
    name: "Bitcoin",
    type: "crypto",
    invested: 3000,
    currentValue: 2750,
    profitLoss: -250,
    percentage: -8.33
  },
  {
    id: "4",
    name: "XP Allocation FIC FIM",
    type: "fund",
    invested: 8000,
    currentValue: 8240,
    profitLoss: 240,
    percentage: 3.0
  }
];

export default function Investments() {
  const totalInvested = investments.reduce((sum, inv) => sum + inv.invested, 0);
  const totalCurrent = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalProfitLoss = totalCurrent - totalInvested;
  const totalPercentage = (totalProfitLoss / totalInvested) * 100;

  const getTypeLabel = (type: Investment["type"]) => {
    switch (type) {
      case "stock": return "Ação";
      case "fund": return "Fundo";
      case "crypto": return "Crypto";
      case "fixed": return "Renda Fixa";
    }
  };

  const getTypeColor = (type: Investment["type"]) => {
    switch (type) {
      case "stock": return "bg-blue-100 text-blue-800";
      case "fund": return "bg-green-100 text-green-800";
      case "crypto": return "bg-orange-100 text-orange-800";
      case "fixed": return "bg-purple-100 text-purple-800";
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Investimentos</h1>
          <p className="text-muted-foreground">Acompanhe sua carteira de investimentos</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Investimento
        </Button>
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
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">tipos de ativos</p>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por Tipo */}
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
              const typeTotal = typeInvestments.reduce((sum, inv) => sum + inv.currentValue, 0);
              const typePercentage = (typeTotal / totalCurrent) * 100;
              
              return typeTotal > 0 ? (
                <div key={type} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{getTypeLabel(type as Investment["type"])}</span>
                    <span className="text-sm">R$ {typeTotal.toLocaleString('pt-BR')} ({typePercentage.toFixed(1)}%)</span>
                  </div>
                  <Progress value={typePercentage} className="h-2" />
                </div>
              ) : null;
            })}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Investimentos */}
      <Card>
        <CardHeader>
          <CardTitle>Meus Investimentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {investments.map((investment) => (
              <div key={investment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                    {investment.profitLoss >= 0 ? 
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
                      <span>Investido: R$ {investment.invested.toLocaleString('pt-BR')}</span>
                      {investment.quantity && <span>• {investment.quantity} cotas</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">
                    R$ {investment.currentValue.toLocaleString('pt-BR')}
                  </div>
                  <div className={`text-sm ${investment.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {investment.profitLoss >= 0 ? '+' : ''}R$ {investment.profitLoss.toLocaleString('pt-BR')} 
                    ({investment.percentage >= 0 ? '+' : ''}{investment.percentage.toFixed(2)}%)
                  </div>
                </div>
              </div>
            ))}
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
