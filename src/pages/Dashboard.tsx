
import { FinancialCard } from "@/components/FinancialCard";
import { ExpenseChart } from "@/components/ExpenseChart";
import { RecentTransactions } from "@/components/RecentTransactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { useAccounts } from "@/hooks/useAccounts";
import { useTransactions } from "@/hooks/useTransactions";
import { useBills } from "@/hooks/useBills";
import { useInvestments } from "@/hooks/useInvestments";

export default function Dashboard() {
  const { data: accounts = [] } = useAccounts();
  const { data: transactions = [] } = useTransactions();
  const { data: bills = [] } = useBills();
  const { data: investments = [] } = useInvestments();

  // Calcular saldo total
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  const totalInvestments = investments.reduce((sum, inv) => sum + inv.current_value, 0);
  const totalPatrimony = totalBalance + totalInvestments;

  // Calcular receitas e despesas do mês atual
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const currentMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear;
  });

  const monthlyIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Calcular próximas faturas (próximos 7 dias)
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const upcomingBills = bills.filter(bill => {
    const dueDate = new Date(bill.due_date);
    const today = new Date();
    return dueDate >= today && dueDate <= nextWeek && bill.status === 'pending';
  });

  const upcomingBillsTotal = upcomingBills.reduce((sum, bill) => sum + bill.amount, 0);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral das suas finanças</p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <FinancialCard
          title="Patrimônio Total"
          value={`R$ ${totalPatrimony.toLocaleString('pt-BR')}`}
          icon={<Wallet className="h-4 w-4" />}
          subtitle="Contas + Investimentos"
        />
        <FinancialCard
          title="Receitas do Mês"
          value={`R$ ${monthlyIncome.toLocaleString('pt-BR')}`}
          type="income"
          icon={<TrendingUp className="h-4 w-4" />}
          subtitle={new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        />
        <FinancialCard
          title="Despesas do Mês"
          value={`R$ ${monthlyExpenses.toLocaleString('pt-BR')}`}
          type="expense"
          icon={<TrendingDown className="h-4 w-4" />}
          subtitle={new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        />
        <FinancialCard
          title="Próximas Faturas"
          value={`R$ ${upcomingBillsTotal.toLocaleString('pt-BR')}`}
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
            {upcomingBills.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Nenhuma fatura vencendo nos próximos 7 dias
              </p>
            ) : (
              upcomingBills.slice(0, 4).map((bill) => {
                const daysUntilDue = Math.ceil(
                  (new Date(bill.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );
                
                return (
                  <div key={bill.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{bill.description}</p>
                      <p className="text-sm text-muted-foreground">
                        Vence em {daysUntilDue} dia{daysUntilDue !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-600">R$ {bill.amount.toLocaleString('pt-BR')}</p>
                      <div className={`w-2 h-2 rounded-full ml-auto ${
                        daysUntilDue <= 2 ? 'bg-red-500' : daysUntilDue <= 5 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
