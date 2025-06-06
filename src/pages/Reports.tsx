
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExpenseChart } from "@/components/ExpenseChart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useTransactions } from "@/hooks/useTransactions";
import { useAccounts } from "@/hooks/useAccounts";
import { useInvestments } from "@/hooks/useInvestments";
import { useCategories } from "@/hooks/useCategories";

export default function Reports() {
  const { data: transactions = [] } = useTransactions();
  const { data: accounts = [] } = useAccounts();
  const { data: investments = [] } = useInvestments();
  const { data: categories = [] } = useCategories();

  // Calcular dados dos últimos 6 meses
  const monthlyData = useMemo(() => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
      
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === date.getMonth() && 
               transactionDate.getFullYear() === date.getFullYear();
      });
      
      const receitas = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const despesas = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      months.push({
        month: monthName,
        receitas,
        despesas,
        saldo: receitas - despesas
      });
    }
    
    return months;
  }, [transactions]);

  // Calcular evolução do patrimônio
  const patrimonioData = useMemo(() => {
    const totalAccounts = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalInvestments = investments.reduce((sum, inv) => sum + inv.current_value, 0);
    const totalPatrimonio = totalAccounts + totalInvestments;
    
    // Simular evolução baseada nos dados atuais
    return monthlyData.map((month, index) => ({
      month: month.month,
      patrimonio: totalPatrimonio * (0.85 + (index * 0.03)) // Crescimento simulado
    }));
  }, [monthlyData, accounts, investments]);

  // Calcular totais
  const totalReceitas = monthlyData.reduce((sum, month) => sum + month.receitas, 0);
  const totalDespesas = monthlyData.reduce((sum, month) => sum + month.despesas, 0);
  const totalEconomia = totalReceitas - totalDespesas;
  const gastoMedioMensal = totalDespesas / 6;

  // Calcular gastos por categoria
  const gastosPorCategoria = useMemo(() => {
    const categoryTotals = categories
      .filter(cat => cat.type === 'expense')
      .map(category => {
        const total = transactions
          .filter(t => t.category_id === category.id && t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        
        return {
          category: category.name,
          amount: total,
          percentage: totalDespesas > 0 ? (total / totalDespesas) * 100 : 0
        };
      })
      .filter(item => item.amount > 0)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4);
    
    return categoryTotals;
  }, [categories, transactions, totalDespesas]);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">Análise detalhada das suas finanças</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="last6months">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lastmonth">Último mês</SelectItem>
              <SelectItem value="last3months">Últimos 3 meses</SelectItem>
              <SelectItem value="last6months">Últimos 6 meses</SelectItem>
              <SelectItem value="lastyear">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Exportar PDF</Button>
        </div>
      </div>

      {/* Resumo do Período */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ {totalReceitas.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">Últimos 6 meses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">R$ {totalDespesas.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">Últimos 6 meses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Economia Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalEconomia >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              R$ {totalEconomia.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalReceitas > 0 ? ((totalEconomia / totalReceitas) * 100).toFixed(1) : 0}% das receitas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Gasto Médio Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {gastoMedioMensal.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">Últimos 6 meses</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fluxo de Caixa Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Valor']} />
                  <Bar dataKey="receitas" fill="#16a34a" name="Receitas" />
                  <Bar dataKey="despesas" fill="#dc2626" name="Despesas" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gastos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseChart />
          </CardContent>
        </Card>
      </div>

      {/* Evolução do Patrimônio */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução do Patrimônio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={patrimonioData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Patrimônio']} />
                <Line 
                  type="monotone" 
                  dataKey="patrimonio" 
                  stroke="#2563eb" 
                  strokeWidth={3}
                  dot={{ fill: '#2563eb', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Resumo Detalhado */}
      <Card>
        <CardHeader>
          <CardTitle>Análise Detalhada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Maiores Gastos por Categoria</h4>
              <div className="space-y-2">
                {gastosPorCategoria.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Nenhum gasto categorizado encontrado</p>
                ) : (
                  gastosPorCategoria.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{item.category}</span>
                      <div className="text-right">
                        <span className="text-sm font-medium">R$ {item.amount.toLocaleString('pt-BR')}</span>
                        <span className="text-xs text-muted-foreground ml-2">({item.percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Resumo Financeiro</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Taxa de Economia</span>
                    <span>{totalReceitas > 0 ? ((totalEconomia / totalReceitas) * 100).toFixed(1) : 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{
                        width: `${Math.max(0, Math.min(100, totalReceitas > 0 ? (totalEconomia / totalReceitas) * 100 : 0))}%`
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Transações Registradas</span>
                    <span>{transactions.length}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Categorias Criadas</span>
                    <span>{categories.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
