
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search } from "lucide-react";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  account: string;
  date: string;
  status: "completed" | "pending";
}

const transactions: Transaction[] = [
  {
    id: "1",
    description: "Salário",
    amount: 5000,
    type: "income",
    category: "Salário",
    account: "Conta Corrente",
    date: "2024-01-15",
    status: "completed"
  },
  {
    id: "2",
    description: "Supermercado Extra",
    amount: -150,
    type: "expense",
    category: "Alimentação",
    account: "Cartão de Débito",
    date: "2024-01-14",
    status: "completed"
  },
  {
    id: "3",
    description: "Uber para trabalho",
    amount: -25,
    type: "expense",
    category: "Transporte",
    account: "Cartão de Crédito",
    date: "2024-01-13",
    status: "completed"
  },
  {
    id: "4",
    description: "Freelance Design",
    amount: 800,
    type: "income",
    category: "Trabalho Extra",
    account: "Conta Corrente",
    date: "2024-01-12",
    status: "completed"
  },
  {
    id: "5",
    description: "Academia mensalidade",
    amount: -120,
    type: "expense",
    category: "Saúde",
    account: "Débito Automático",
    date: "2024-01-11",
    status: "pending"
  }
];

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTransactions = transactions.filter(transaction =>
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Transações</h1>
          <p className="text-muted-foreground">Gerencie todas suas transações</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Transação
        </Button>
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
                placeholder="Buscar transações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">Por Data</Button>
            <Button variant="outline">Por Categoria</Button>
            <Button variant="outline">Por Conta</Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Transações */}
      <Card>
        <CardHeader>
          <CardTitle>Todas as Transações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{transaction.description}</p>
                    <Badge variant={transaction.status === "completed" ? "default" : "secondary"}>
                      {transaction.status === "completed" ? "Realizado" : "Pendente"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{transaction.category}</span>
                    <span>•</span>
                    <span>{transaction.account}</span>
                    <span>•</span>
                    <span>{new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-semibold ${
                    transaction.type === "income" ? "text-green-600" : "text-red-600"
                  }`}>
                    {transaction.type === "income" ? "+" : ""}R$ {Math.abs(transaction.amount).toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
