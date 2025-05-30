
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
}

const transactions: Transaction[] = [
  {
    id: "1",
    description: "Salário",
    amount: 5000,
    type: "income",
    category: "Salário",
    date: "2024-01-15"
  },
  {
    id: "2",
    description: "Supermercado",
    amount: -150,
    type: "expense",
    category: "Alimentação",
    date: "2024-01-14"
  },
  {
    id: "3",
    description: "Uber",
    amount: -25,
    type: "expense",
    category: "Transporte",
    date: "2024-01-13"
  },
  {
    id: "4",
    description: "Freelance",
    amount: 800,
    type: "income",
    category: "Trabalho Extra",
    date: "2024-01-12"
  },
  {
    id: "5",
    description: "Academia",
    amount: -120,
    type: "expense",
    category: "Saúde",
    date: "2024-01-11"
  }
];

export function RecentTransactions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transações Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">{transaction.description}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {transaction.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(transaction.date).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
              <div className={`text-sm font-medium ${
                transaction.type === "income" ? "text-green-600" : "text-red-600"
              }`}>
                {transaction.type === "income" ? "+" : ""}R$ {Math.abs(transaction.amount).toLocaleString('pt-BR')}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
