
import { FinancialCard } from "@/components/FinancialCard";
import { ExpenseChart } from "@/components/ExpenseChart";
import { RecentTransactions } from "@/components/RecentTransactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, TrendingDown, Calendar } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral das suas finanças</p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <FinancialCard
          title="Saldo Total"
          value="R$ 12.450,00"
          icon={<Wallet className="h-4 w-4" />}
          subtitle="Todas as contas"
        />
        <FinancialCard
          title="Receitas do Mês"
          value="R$ 5.800,00"
          type="income"
          icon={<TrendingUp className="h-4 w-4" />}
          subtitle="Janeiro 2024"
        />
        <FinancialCard
          title="Despesas do Mês"
          value="R$ 3.300,00"
          type="expense"
          icon={<TrendingDown className="h-4 w-4" />}
          subtitle="Janeiro 2024"
        />
        <FinancialCard
          title="Próximas Faturas"
          value="R$ 1.250,00"
          icon={<Calendar className="h-4 w-4" />}
          subtitle="Próximos 7 dias"
        />
      </div>

      {/* Gráficos e Transações */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gastos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseChart />
          </CardContent>
        </Card>

        <RecentTransactions />
      </div>

      {/* Contas a Vencer */}
      <Card>
        <CardHeader>
          <CardTitle>Próximas Faturas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: "Cartão de Crédito", amount: 850, dueDate: "25/01", status: "pending" },
              { name: "Aluguel", amount: 1200, dueDate: "05/02", status: "pending" },
              { name: "Internet", amount: 89, dueDate: "15/02", status: "pending" },
              { name: "Energia", amount: 120, dueDate: "20/02", status: "pending" }
            ].map((bill, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{bill.name}</p>
                  <p className="text-sm text-muted-foreground">Vence em {bill.dueDate}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-red-600">R$ {bill.amount.toLocaleString('pt-BR')}</p>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full ml-auto"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
